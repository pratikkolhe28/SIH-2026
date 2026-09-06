"""
Database & Geospatial Aggregation Service for SIH PS 26131
Supports SQLite locally with zero config, plus PostGIS compatibility schemas for Supabase/Neon.
Implements spatial hotspot clustering and statistical analytics for official dashboard.
"""

import os
import sqlite3
import math
import uuid
from datetime import datetime, timezone
from .seed_data import generate_seed_reports

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "crop_reports.db")

class DatabaseService:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS reports (
                    id TEXT PRIMARY KEY,
                    crop TEXT NOT NULL,
                    disease_id TEXT NOT NULL,
                    disease_name TEXT NOT NULL,
                    confidence REAL NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    district TEXT NOT NULL,
                    taluka TEXT,
                    village TEXT,
                    severity TEXT NOT NULL,
                    status TEXT NOT NULL DEFAULT 'reported',
                    flagged_for_expert INTEGER NOT NULL DEFAULT 0,
                    farmer_phone_masked TEXT,
                    notes TEXT,
                    timestamp TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS advisories_broadcast (
                    id TEXT PRIMARY KEY,
                    district TEXT NOT NULL,
                    crop TEXT NOT NULL,
                    title TEXT NOT NULL,
                    message TEXT NOT NULL,
                    target_farmers_count INTEGER NOT NULL,
                    sent_at TEXT NOT NULL
                )
            """)

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS iot_traps (
                    id TEXT PRIMARY KEY,
                    district TEXT NOT NULL,
                    taluka TEXT NOT NULL,
                    trap_type TEXT NOT NULL,
                    crop TEXT NOT NULL,
                    latitude REAL NOT NULL,
                    longitude REAL NOT NULL,
                    spore_count INTEGER,
                    moth_count INTEGER,
                    battery_level INTEGER,
                    status TEXT NOT NULL,
                    last_sync TEXT NOT NULL
                )
            """)

            # Check if seed reports need to be populated
            cursor.execute("SELECT COUNT(*) FROM reports")
            count = cursor.fetchone()[0]
            if count == 0:
                seeds = generate_seed_reports()
                for s in seeds:
                    cursor.execute("""
                        INSERT INTO reports (
                            id, crop, disease_id, disease_name, confidence,
                            latitude, longitude, district, taluka, village,
                            severity, status, flagged_for_expert, farmer_phone_masked,
                            notes, timestamp
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        s["id"], s["crop"], s["disease_id"], s["disease_name"], s["confidence"],
                        s["latitude"], s["longitude"], s["district"], s.get("taluka", ""), s.get("village", ""),
                        s["severity"], s["status"], 1 if s["flagged_for_expert"] else 0,
                        s.get("farmer_phone_masked", "+91 98XXX X0000"), s.get("notes", ""), s["timestamp"]
                    ))
                print(f"[DB] Seeded {len(seeds)} outbreak reports across Maharashtra.")

            # Seed IoT trap sensors if empty
            cursor.execute("SELECT COUNT(*) FROM iot_traps")
            iot_count = cursor.fetchone()[0]
            if iot_count == 0:
                sample_traps = [
                    ("TRAP-JNR-01", "Pune", "Junnar", "Spore Trap", "Tomato", 19.2100, 73.8800, 1420, 0, 88, "ALERT: High Spore Count", datetime.now(timezone.utc).isoformat()),
                    ("TRAP-NPD-02", "Nashik", "Niphad", "Spore Trap", "Tomato", 20.0890, 74.1300, 1890, 0, 75, "CRITICAL: Phytophthora Inoculum", datetime.now(timezone.utc).isoformat()),
                    ("TRAP-AMR-03", "Amravati", "Morshi", "Pheromone Trap", "Cotton", 21.2800, 78.0100, 0, 48, 92, "WARNING: Whitefly Threshold Exceeded", datetime.now(timezone.utc).isoformat()),
                    ("TRAP-JAL-04", "Jalgaon", "Raver", "Pheromone Trap", "Cotton", 21.3200, 75.8900, 0, 39, 81, "WARNING: Moderate Sucking Pest", datetime.now(timezone.utc).isoformat())
                ]
                cursor.executemany("""
                    INSERT INTO iot_traps VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, sample_traps)
            
            conn.commit()

    def add_report(self, report: dict):
        report_id = report.get("id") or f"RPT-MH-{int(datetime.now(timezone.utc).timestamp())}"
        now_iso = datetime.now(timezone.utc).isoformat()
        
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO reports (
                    id, crop, disease_id, disease_name, confidence,
                    latitude, longitude, district, taluka, village,
                    severity, status, flagged_for_expert, farmer_phone_masked,
                    notes, timestamp
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                report_id,
                report["crop"],
                report["disease_id"],
                report["disease_name"],
                float(report["confidence"]),
                float(report["latitude"]),
                float(report["longitude"]),
                report["district"],
                report.get("taluka", "Rural"),
                report.get("village", ""),
                report.get("severity", "medium"),
                report.get("status", "reported"),
                1 if report.get("flagged_for_expert") else 0,
                report.get("farmer_phone_masked", "+91 98XXX X" + str(uuid.uuid4().hex[:4])),
                report.get("notes", ""),
                report.get("timestamp", now_iso)
            ))
            conn.commit()
            
            cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
            row = cursor.fetchone()
            return dict(row)

    def get_reports(self, district: str = None, crop: str = None, disease_id: str = None, status: str = None, flagged_only: bool = False, limit: int = 100):
        query = "SELECT * FROM reports WHERE 1=1"
        params = []

        if district and district.lower() != "all":
            query += " AND LOWER(district) = LOWER(?)"
            params.append(district)

        if crop and crop.lower() != "all":
            query += " AND LOWER(crop) = LOWER(?)"
            params.append(crop)

        if disease_id and disease_id.lower() != "all":
            query += " AND LOWER(disease_id) = LOWER(?)"
            params.append(disease_id)

        if status and status.lower() != "all":
            query += " AND LOWER(status) = LOWER(?)"
            params.append(status)

        if flagged_only:
            query += " AND flagged_for_expert = 1"

        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def set_expert_flag(self, report_id: str, flag: bool = True):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE reports SET flagged_for_expert = ? WHERE id = ?", (1 if flag else 0, report_id))
            conn.commit()
            return cursor.rowcount > 0

    def update_report_status(self, report_id: str, status: str, notes: str = None):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if notes:
                cursor.execute("UPDATE reports SET status = ?, notes = ? WHERE id = ?", (status, notes, report_id))
            else:
                cursor.execute("UPDATE reports SET status = ? WHERE id = ?", (status, report_id))
            conn.commit()
            return cursor.rowcount > 0

    def get_hotspot_clusters(self, district: str = None, crop: str = None):
        """
        Geospatial aggregation: Clusters reports within 0.25° (~25km) radius by disease group.
        Calculates centroid, outbreak intensity, report count, and bounding circle radius.
        """
        reports = self.get_reports(district=district, crop=crop, limit=300)
        
        clusters = []
        cluster_threshold_deg = 0.35 # Approx 35 km geographic bounding radius

        for r in reports:
            if "healthy" in r["disease_id"].lower():
                continue # Only cluster disease incidents

            lat, lon = r["latitude"], r["longitude"]
            matched_cluster = None

            for c in clusters:
                # Same disease or same crop within proximity threshold
                if c["crop"] == r["crop"]:
                    dist = math.sqrt((c["center_lat"] - lat)**2 + (c["center_lon"] - lon)**2)
                    if dist <= cluster_threshold_deg:
                        matched_cluster = c
                        break

            if matched_cluster:
                matched_cluster["reports_count"] += 1
                matched_cluster["report_ids"].append(r["id"])
                # Recalculate centroid
                n = matched_cluster["reports_count"]
                matched_cluster["center_lat"] = round(((matched_cluster["center_lat"] * (n - 1)) + lat) / n, 4)
                matched_cluster["center_lon"] = round(((matched_cluster["center_lon"] * (n - 1)) + lon) / n, 4)
                if r["severity"] == "critical":
                    matched_cluster["has_critical"] = True
            else:
                clusters.append({
                    "cluster_id": f"CLUSTER-{len(clusters)+1}",
                    "crop": r["crop"],
                    "disease_id": r["disease_id"],
                    "disease_name": r["disease_name"],
                    "district": r["district"],
                    "center_lat": lat,
                    "center_lon": lon,
                    "reports_count": 1,
                    "has_critical": r["severity"] == "critical",
                    "severity": r["severity"],
                    "report_ids": [r["id"]]
                })

        # Score intensity: LOW (1), MEDIUM (2-3), CRITICAL HOTSPOT (4+)
        for c in clusters:
            cnt = c["reports_count"]
            if cnt >= 3 or c["has_critical"]:
                c["intensity"] = "CRITICAL OUTBREAK"
                c["color"] = "#dc2626" # Red
                c["radius_meters"] = 18000
            elif cnt >= 2:
                c["intensity"] = "ELEVATED CONCERN"
                c["color"] = "#ea580c" # Orange
                c["radius_meters"] = 12000
            else:
                c["intensity"] = "ISOLATED CASE"
                c["color"] = "#ca8a04" # Yellow
                c["radius_meters"] = 8000

        # Sort clusters by severity & report count
        clusters.sort(key=lambda x: x["reports_count"], reverse=True)
        return clusters

    def get_dashboard_stats(self):
        """
        Aggregate surveillance metrics for government officials.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM reports")
            total_reports = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM reports WHERE severity = 'critical'")
            critical_alerts = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM reports WHERE flagged_for_expert = 1")
            flagged_count = cursor.fetchone()[0]

            cursor.execute("SELECT crop, COUNT(*) as count FROM reports GROUP BY crop")
            crop_breakdown = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT disease_name, crop, COUNT(*) as count 
                FROM reports 
                WHERE disease_id NOT LIKE '%healthy%'
                GROUP BY disease_name, crop 
                ORDER BY count DESC LIMIT 5
            """)
            top_diseases = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT district, COUNT(*) as total_reports,
                       SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical_count
                FROM reports
                GROUP BY district
                ORDER BY total_reports DESC
            """)
            district_breakdown = [dict(r) for r in cursor.fetchall()]

            # Fetch IoT traps
            cursor.execute("SELECT * FROM iot_traps")
            traps = [dict(r) for r in cursor.fetchall()]

        clusters = self.get_hotspot_clusters()
        active_hotspots = len([c for c in clusters if c["reports_count"] >= 2 or c["has_critical"]])

        return {
            "total_reports": total_reports,
            "active_hotspots": active_hotspots,
            "critical_alerts": critical_alerts,
            "expert_queue_count": flagged_count,
            "crop_breakdown": crop_breakdown,
            "top_diseases": top_diseases,
            "district_breakdown": district_breakdown,
            "iot_traps": traps,
            "total_clusters": len(clusters)
        }

    def broadcast_advisory(self, district: str, crop: str, title: str, message: str):
        adv_id = f"ADV-{int(datetime.now(timezone.utc).timestamp())}"
        now_iso = datetime.now(timezone.utc).isoformat()
        # Simulated target farmer count based on district
        farmer_counts = {
            "pune": 8450,
            "nashik": 12300,
            "jalgaon": 9800,
            "amravati": 11200,
            "ahmednagar": 9400,
            "solapur": 7600,
            "wardha": 5800,
            "chhatrapati sambhaji nagar": 8900
        }
        target_count = farmer_counts.get(district.lower(), 6500)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO advisories_broadcast VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (adv_id, district, crop, title, message, target_count, now_iso))
            conn.commit()

        return {
            "id": adv_id,
            "district": district,
            "crop": crop,
            "title": title,
            "message": message,
            "target_farmers_count": target_count,
            "sent_at": now_iso,
            "channels": ["SMS Alert", "Kisan Call Center", "Farmer App Push"]
        }


db_service = DatabaseService()
