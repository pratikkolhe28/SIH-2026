"""
Database & Geospatial Aggregation Service for SIH PS 26131
Supports SQLite locally with zero config, plus PostGIS compatibility schemas for Supabase/Neon.
Implements spatial hotspot clustering and statistical analytics for official dashboard.
"""

import os
import sqlite3
import math
import uuid
import json
from datetime import datetime, timezone, timedelta
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
                    timestamp TEXT NOT NULL,
                    source_type TEXT NOT NULL DEFAULT 'farmer',
                    verification_status TEXT NOT NULL DEFAULT 'unverified',
                    crop_stage TEXT,
                    observed_symptoms TEXT,
                    image_hash TEXT,
                    intervention_cost REAL,
                    outcome TEXT,
                    follow_up_notes TEXT
                )
            """)

            # Forward-compatible migrations for existing SQLite databases.
            existing_columns = {row[1] for row in cursor.execute("PRAGMA table_info(reports)").fetchall()}
            migrations = {
                "source_type": "TEXT NOT NULL DEFAULT 'farmer'",
                "verification_status": "TEXT NOT NULL DEFAULT 'unverified'",
                "crop_stage": "TEXT",
                "observed_symptoms": "TEXT",
                "image_hash": "TEXT",
                "intervention_cost": "REAL",
                "outcome": "TEXT",
                "follow_up_notes": "TEXT",
            }
            for column, declaration in migrations.items():
                if column not in existing_columns:
                    cursor.execute(f"ALTER TABLE reports ADD COLUMN {column} {declaration}")
            # One-time provenance migration for the supplied historical fixture database.
            # Do not reclassify reports on every server startup.
            cursor.execute("CREATE TABLE IF NOT EXISTS schema_migrations (migration_id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)")
            migration_id = "demo_provenance_20261029"
            cursor.execute("SELECT 1 FROM schema_migrations WHERE migration_id=?", (migration_id,))
            if not cursor.fetchone():
                cursor.execute("UPDATE reports SET source_type='demo', verification_status='demo' WHERE id LIKE 'RPT-MH-2026-%'")
                cursor.execute("UPDATE reports SET source_type='demo', verification_status='demo' WHERE notes LIKE 'Detected via Mobile App. Top match:%'")
                cursor.execute("INSERT INTO schema_migrations (migration_id, applied_at) VALUES (?, ?)", (migration_id, datetime.now(timezone.utc).isoformat()))
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_image_hash ON reports(image_hash)")
            cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_timestamp ON reports(timestamp)")

            cursor.execute("""
                CREATE TABLE IF NOT EXISTS follow_ups (
                    id TEXT PRIMARY KEY,
                    report_id TEXT NOT NULL,
                    observed_at TEXT NOT NULL,
                    symptoms_status TEXT NOT NULL,
                    intervention_used TEXT,
                    intervention_cost REAL,
                    estimated_loss REAL,
                    yield_outcome TEXT,
                    notes TEXT,
                    FOREIGN KEY(report_id) REFERENCES reports(id)
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
                            notes, timestamp, source_type, verification_status
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        s["id"], s["crop"], s["disease_id"], s["disease_name"], s["confidence"],
                        s["latitude"], s["longitude"], s["district"], s.get("taluka", ""), s.get("village", ""),
                        s["severity"], s["status"], 1 if s["flagged_for_expert"] else 0,
                        s.get("farmer_phone_masked", "+91 98XXX X0000"), s.get("notes", ""), s["timestamp"], "demo", "demo"
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
        report_id = report.get("id") or f"RPT-MH-{int(datetime.now(timezone.utc).timestamp())}-{uuid.uuid4().hex[:6]}"
        now_iso = datetime.now(timezone.utc).isoformat()
        image_hash = report.get("image_hash")
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Suppress same-image duplicates from the same approximate location in 24 hours.
            if image_hash:
                cutoff = (datetime.now(timezone.utc) - timedelta(hours=24)).isoformat()
                cursor.execute("""SELECT * FROM reports WHERE image_hash=? AND timestamp>=?
                    AND ABS(latitude-?) < 0.02 AND ABS(longitude-?) < 0.02
                    ORDER BY timestamp DESC LIMIT 1""", (image_hash, cutoff, float(report["latitude"]), float(report["longitude"])))
                duplicate = cursor.fetchone()
                if duplicate:
                    result = dict(duplicate)
                    result["duplicate_suppressed"] = True
                    return result

            cursor.execute("""INSERT INTO reports (
                id, crop, disease_id, disease_name, confidence, latitude, longitude,
                district, taluka, village, severity, status, flagged_for_expert,
                farmer_phone_masked, notes, timestamp, source_type, verification_status,
                crop_stage, observed_symptoms, image_hash, intervention_cost, outcome, follow_up_notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""", (
                report_id, report["crop"], report["disease_id"], report["disease_name"],
                float(report.get("confidence", 0)), float(report["latitude"]), float(report["longitude"]),
                report.get("district", "Unknown"), report.get("taluka", ""), report.get("village", ""),
                report.get("severity", "medium"), report.get("status", "reported"),
                1 if report.get("flagged_for_expert") else 0,
                report.get("farmer_phone_masked", "+91 98XXX X" + str(uuid.uuid4().hex[:4])),
                report.get("notes", ""), report.get("timestamp", now_iso),
                report.get("source_type", "farmer"), report.get("verification_status", "unverified"),
                report.get("crop_stage"), report.get("observed_symptoms"), image_hash,
                report.get("intervention_cost"), report.get("outcome"), report.get("follow_up_notes")
            ))
            conn.commit()
            cursor.execute("SELECT * FROM reports WHERE id = ?", (report_id,))
            return dict(cursor.fetchone())

    def add_follow_up(self, report_id: str, data: dict):
        now_iso = datetime.now(timezone.utc).isoformat()
        follow_id = f"FU-{uuid.uuid4().hex[:12]}"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id FROM reports WHERE id=?", (report_id,))
            if not cursor.fetchone():
                return None
            cursor.execute("""INSERT INTO follow_ups
                (id, report_id, observed_at, symptoms_status, intervention_used, intervention_cost, estimated_loss, yield_outcome, notes)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""", (
                    follow_id, report_id, now_iso, data.get("symptoms_status", "unknown"),
                    data.get("intervention_used", ""), data.get("intervention_cost"),
                    data.get("estimated_loss"), data.get("yield_outcome", ""), data.get("notes", "")
                ))
            cursor.execute("UPDATE reports SET intervention_cost=COALESCE(?, intervention_cost), outcome=?, follow_up_notes=? WHERE id=?",
                           (data.get("intervention_cost"), data.get("yield_outcome", ""), data.get("notes", ""), report_id))
            conn.commit()
            return {"id": follow_id, "report_id": report_id, "observed_at": now_iso, **data}

    def get_follow_ups(self, report_id: str):
        with self._get_connection() as conn:
            rows = conn.execute("SELECT * FROM follow_ups WHERE report_id=? ORDER BY observed_at DESC", (report_id,)).fetchall()
            return [dict(row) for row in rows]

    def get_reports(self, district: str = None, crop: str = None, disease_id: str = None, status: str = None, flagged_only: bool = False, limit: int = 100, include_demo: bool = True):
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
        if not include_demo:
            query += " AND source_type != 'demo'"

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
        allowed = {"reported", "investigating", "under_review", "contained", "confirmed", "rejected", "resolved"}
        if status not in allowed:
            raise ValueError(f"Status must be one of: {', '.join(sorted(allowed))}")
        verification = "confirmed" if status == "confirmed" else "rejected" if status == "rejected" else "unverified"
        with self._get_connection() as conn:
            cursor = conn.cursor()
            if notes:
                cursor.execute("UPDATE reports SET status = ?, notes = ?, verification_status = ? WHERE id = ?", (status, notes, verification, report_id))
            else:
                cursor.execute("UPDATE reports SET status = ?, verification_status = ? WHERE id = ?", (status, verification, report_id))
            conn.commit()
            return cursor.rowcount > 0

    def get_hotspot_clusters(self, district: str = None, crop: str = None, include_demo: bool = False):
        """
        Cluster recent, non-rejected observations by crop, disease, district and provenance.
        Demo fixtures can be included for a clearly labelled map preview, never live stats.
        """
        reports = self.get_reports(district=district, crop=crop, limit=500, include_demo=include_demo)
        
        clusters = []
        cluster_threshold_deg = 0.35  # Approximate local bounding radius in degrees

        cutoff = datetime.now(timezone.utc) - timedelta(days=14)
        for r in reports:
            if "healthy" in r["disease_id"].lower() or r.get("verification_status") == "rejected":
                continue
            try:
                observed_at = datetime.fromisoformat(str(r.get("timestamp", "")).replace("Z", "+00:00"))
                if observed_at.tzinfo is None:
                    observed_at = observed_at.replace(tzinfo=timezone.utc)
            except Exception:
                continue
            if observed_at < cutoff and not (include_demo and r.get("source_type") == "demo"):
                continue

            lat, lon = r["latitude"], r["longitude"]
            matched_cluster = None

            for c in clusters:
                # Same disease or same crop within proximity threshold
                if c["crop"] == r["crop"] and c["disease_id"] == r["disease_id"] and c["district"].lower() == str(r["district"]).lower() and c.get("source_type", "farmer") == r.get("source_type", "farmer"):
                    # Approximate local distance; longitude scales with latitude.
                    dy = (c["center_lat"] - lat) * 111.0
                    dx = (c["center_lon"] - lon) * 111.0 * math.cos(math.radians(lat))
                    dist = math.sqrt(dx * dx + dy * dy) / 111.0
                    if dist <= cluster_threshold_deg:
                        matched_cluster = c
                        break

            if matched_cluster:
                matched_cluster["reports_count"] += 1
                matched_cluster["recent_reports"] += 1
                if r.get("verification_status") == "confirmed":
                    matched_cluster["verified_reports"] += 1
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
                    "verified_reports": 1 if r.get("verification_status") == "confirmed" else 0,
                    "recent_reports": 1,
                    "source_type": r.get("source_type", "farmer"),
                    "report_ids": [r["id"]]
                })

        # Observations create a suspected cluster, never a confirmed outbreak by count alone.
        for c in clusters:
            cnt = c["reports_count"]
            if c["verified_reports"] >= 2 and cnt >= 3:
                c["intensity"] = "EXPERT-SUPPORTED CLUSTER"
                c["verification_status"] = "expert_supported"
                c["color"] = "#dc2626"
                c["radius_meters"] = 18000
            elif cnt >= 3:
                c["intensity"] = "SUSPECTED CLUSTER — VERIFY"
                c["verification_status"] = "unverified"
                c["color"] = "#ea580c"
                c["radius_meters"] = 12000
            elif cnt >= 2:
                c["intensity"] = "EMERGING SIGNAL — VERIFY"
                c["verification_status"] = "unverified"
                c["color"] = "#ca8a04"
                c["radius_meters"] = 8000
            else:
                c["intensity"] = "ISOLATED OBSERVATION"
                c["verification_status"] = "unverified"
                c["color"] = "#ca8a04"
                c["radius_meters"] = 5000

        # Sort clusters by severity & report count
        clusters.sort(key=lambda x: x["reports_count"], reverse=True)
        return clusters

    def get_dashboard_stats(self):
        """
        Aggregate surveillance metrics for government officials.
        """
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM reports WHERE source_type != 'demo'")
            total_reports = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM reports WHERE severity = 'critical' AND source_type != 'demo' AND verification_status = 'confirmed'")
            critical_alerts = cursor.fetchone()[0]

            cursor.execute("SELECT COUNT(*) FROM reports WHERE flagged_for_expert = 1 AND source_type != 'demo'")
            flagged_count = cursor.fetchone()[0]

            cursor.execute("SELECT crop, COUNT(*) as count FROM reports WHERE source_type != 'demo' GROUP BY crop")
            crop_breakdown = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT disease_name, crop, COUNT(*) as count 
                FROM reports 
                WHERE disease_id NOT LIKE '%healthy%' AND source_type != 'demo'
                GROUP BY disease_name, crop 
                ORDER BY count DESC LIMIT 5
            """)
            top_diseases = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
                SELECT district, COUNT(*) as total_reports,
                       SUM(CASE WHEN severity = 'critical' AND verification_status = 'confirmed' THEN 1 ELSE 0 END) as critical_count
                FROM reports WHERE source_type != 'demo'
                GROUP BY district
                ORDER BY total_reports DESC
            """)
            district_breakdown = [dict(r) for r in cursor.fetchall()]

            # Fetch IoT traps
            cursor.execute("SELECT * FROM iot_traps")
            traps = [dict(r) for r in cursor.fetchall()]

        clusters = self.get_hotspot_clusters()
        active_hotspots = len([c for c in clusters if c["reports_count"] >= 2 and c.get("verification_status") != "unverified"])

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

    def get_impact_metrics(self):
        """Summarize recorded follow-up data without claiming causal savings."""
        with self._get_connection() as conn:
            row = conn.execute("""SELECT COUNT(*) AS follow_up_count,
                SUM(CASE WHEN symptoms_status='improving' THEN 1 ELSE 0 END) AS improving_count,
                SUM(CASE WHEN symptoms_status='worsening' THEN 1 ELSE 0 END) AS worsening_count,
                SUM(COALESCE(follow_ups.intervention_cost, 0)) AS reported_intervention_cost,
                SUM(COALESCE(follow_ups.estimated_loss, 0)) AS farmer_estimated_loss
                FROM follow_ups JOIN reports ON reports.id=follow_ups.report_id
                WHERE reports.source_type != 'demo'""").fetchone()
            return {
                "follow_up_count": int(row["follow_up_count"] or 0),
                "improving_count": int(row["improving_count"] or 0),
                "worsening_count": int(row["worsening_count"] or 0),
                "reported_intervention_cost_inr": round(float(row["reported_intervention_cost"] or 0), 2),
                "farmer_estimated_loss_inr": round(float(row["farmer_estimated_loss"] or 0), 2),
                "interpretation": "Self-reported observations only; not a causal estimate of yield saved or loss avoided."
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
