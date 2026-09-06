"""
Generate botanical sample leaf test images for instant 1-click hackathon demos.
"""

import os
from PIL import Image, ImageDraw, ImageFilter

SAMPLES_DIR = os.path.dirname(__file__)

def create_sample_leaves():
    # 1. Tomato Early Blight (Green leaf with dark concentric brown rings & yellow halo)
    img1 = Image.new("RGB", (320, 320), color=(46, 125, 50))
    d1 = ImageDraw.Draw(img1)
    # Leaf contour shading
    d1.ellipse([20, 20, 300, 300], fill=(56, 142, 60))
    # Veins
    d1.line([(160, 20), (160, 300)], fill=(76, 175, 80), width=4)
    d1.line([(160, 100), (60, 60)], fill=(76, 175, 80), width=2)
    d1.line([(160, 160), (260, 120)], fill=(76, 175, 80), width=2)
    d1.line([(160, 220), (70, 200)], fill=(76, 175, 80), width=2)
    # Early Blight concentric rings (Target boards)
    # Spot 1
    d1.ellipse([80, 90, 170, 180], fill=(212, 175, 55)) # Yellow halo
    d1.ellipse([95, 105, 155, 165], fill=(92, 51, 23)) # Outer brown ring
    d1.ellipse([105, 115, 145, 155], fill=(139, 69, 19)) # Inner brown ring
    d1.ellipse([118, 128, 132, 142], fill=(47, 23, 8)) # Center dark spot
    # Spot 2
    d1.ellipse([180, 170, 250, 240], fill=(212, 175, 55))
    d1.ellipse([190, 180, 240, 230], fill=(92, 51, 23))
    d1.ellipse([205, 195, 225, 215], fill=(47, 23, 8))
    img1 = img1.filter(ImageFilter.GaussianBlur(1))
    img1.save(os.path.join(SAMPLES_DIR, "tomato_early_blight_sample.jpg"), quality=92)

    # 2. Tomato Late Blight (Dark water-soaked necrotic rot & fuzzy pale margins)
    img2 = Image.new("RGB", (320, 320), color=(46, 125, 50))
    d2 = ImageDraw.Draw(img2)
    d2.ellipse([20, 20, 300, 300], fill=(56, 142, 60))
    d2.line([(160, 20), (160, 300)], fill=(67, 160, 71), width=4)
    # Large water-soaked irregular patches
    d2.polygon([(40, 60), (180, 40), (220, 150), (140, 210), (50, 160)], fill=(33, 33, 33))
    d2.polygon([(160, 180), (280, 160), (290, 270), (180, 260)], fill=(45, 45, 45))
    # Pale mycelium fringe
    d2.ellipse([35, 55, 80, 95], outline=(220, 220, 210), width=3)
    d2.ellipse([200, 140, 240, 170], outline=(220, 220, 210), width=2)
    img2 = img2.filter(ImageFilter.GaussianBlur(1.2))
    img2.save(os.path.join(SAMPLES_DIR, "tomato_late_blight_sample.jpg"), quality=92)

    # 3. Potato Early Blight (Dark necrotic spots with rings)
    img3 = Image.new("RGB", (320, 320), color=(67, 160, 71))
    d3 = ImageDraw.Draw(img3)
    d3.ellipse([30, 20, 290, 300], fill=(76, 175, 80))
    d3.line([(160, 20), (160, 300)], fill=(90, 190, 95), width=3)
    # Rings
    for cx, cy in [(110, 120), (210, 180), (140, 230)]:
        d3.ellipse([cx-40, cy-40, cx+40, cy+40], fill=(200, 180, 60))
        d3.ellipse([cx-30, cy-30, cx+30, cy+30], fill=(101, 67, 33))
        d3.ellipse([cx-18, cy-18, cx+18, cy+18], fill=(140, 90, 45))
        d3.ellipse([cx-8, cy-8, cx+8, cy+8], fill=(50, 30, 15))
    img3 = img3.filter(ImageFilter.GaussianBlur(1))
    img3.save(os.path.join(SAMPLES_DIR, "potato_early_blight_sample.jpg"), quality=92)

    # 4. Cotton Bacterial Blight (Black Arm vein-bounded angular lesions)
    img4 = Image.new("RGB", (320, 320), color=(56, 142, 60))
    d4 = ImageDraw.Draw(img4)
    # Cotton palmate leaf lobes
    d4.polygon([(160, 30), (290, 130), (240, 280), (80, 280), (30, 130)], fill=(67, 160, 71))
    # Veins
    d4.line([(160, 280), (160, 40)], fill=(129, 199, 132), width=4)
    d4.line([(160, 200), (50, 130)], fill=(129, 199, 132), width=3)
    d4.line([(160, 200), (270, 130)], fill=(129, 199, 132), width=3)
    # Vein-bounded angular black spots
    d4.polygon([(110, 140), (150, 130), (145, 175), (105, 170)], fill=(20, 20, 20))
    d4.polygon([(170, 135), (215, 145), (210, 185), (165, 175)], fill=(25, 25, 25))
    d4.polygon([(130, 210), (155, 205), (150, 245), (125, 240)], fill=(15, 15, 15))
    # Black arm stalk lesion
    d4.rectangle([152, 250, 168, 300], fill=(20, 20, 20))
    img4 = img4.filter(ImageFilter.GaussianBlur(0.8))
    img4.save(os.path.join(SAMPLES_DIR, "cotton_bacterial_blight_sample.jpg"), quality=92)

    # 5. Cotton Leaf Curl (Chlorosis & upward margin curling)
    img5 = Image.new("RGB", (320, 320), color=(139, 195, 74))
    d5 = ImageDraw.Draw(img5)
    d5.polygon([(160, 40), (280, 130), (240, 270), (80, 270), (40, 130)], fill=(205, 220, 57))
    # Thickened veins
    d5.line([(160, 270), (160, 50)], fill=(46, 125, 50), width=6)
    d5.line([(160, 190), (60, 130)], fill=(46, 125, 50), width=5)
    d5.line([(160, 190), (260, 130)], fill=(46, 125, 50), width=5)
    # Wrinkle contours
    d5.arc([70, 100, 150, 180], start=30, end=200, fill=(100, 160, 40), width=3)
    d5.arc([170, 100, 250, 180], start=340, end=150, fill=(100, 160, 40), width=3)
    img5 = img5.filter(ImageFilter.GaussianBlur(1))
    img5.save(os.path.join(SAMPLES_DIR, "cotton_leaf_curl_sample.jpg"), quality=92)

    # 6. Tomato Healthy (Lush vibrant green)
    img6 = Image.new("RGB", (320, 320), color=(46, 125, 50))
    d6 = ImageDraw.Draw(img6)
    d6.ellipse([30, 30, 290, 290], fill=(76, 175, 80))
    d6.line([(160, 30), (160, 290)], fill=(129, 199, 132), width=3)
    d6.line([(160, 100), (80, 70)], fill=(129, 199, 132), width=2)
    d6.line([(160, 160), (240, 120)], fill=(129, 199, 132), width=2)
    d6.line([(160, 220), (90, 190)], fill=(129, 199, 132), width=2)
    img6 = img6.filter(ImageFilter.GaussianBlur(0.8))
    img6.save(os.path.join(SAMPLES_DIR, "tomato_healthy_sample.jpg"), quality=92)

    print(f"[Samples] Generated 6 botanical test leaf images in {SAMPLES_DIR}")

if __name__ == "__main__":
    create_sample_leaves()
