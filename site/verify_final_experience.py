import os
import time
from playwright.sync_api import sync_playwright

CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
OUT_DIR = r"C:\Users\ASUS\.gemini\antigravity-ide\brain\3cb5e616-f7c3-4d93-bb50-845b70f1d532\scratch\verify"
os.makedirs(OUT_DIR, exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROME, headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # Track console messages
    page.on("console", lambda m: print(f"[{m.type}] {m.text}") if m.type in ("error", "warning") else None)
    
    page.goto("http://127.0.0.1:8766/")
    
    # 1. Capture during center stack shuffle (t = 1.7s after navigation, preloader finishes at 1.25s)
    page.wait_for_timeout(1700)
    page.screenshot(path=os.path.join(OUT_DIR, "final_1_intro_center_stack.png"))
    print("1. Captured center stack shuffle")

    # 2. Capture when all cards flow outward and typography settles (t = 3.6s)
    page.wait_for_timeout(1900)
    page.screenshot(path=os.path.join(OUT_DIR, "final_2_hero_collage_settled.png"))
    print("2. Captured hero outward flow settled")

    # 3. Simulate mouse movement across hero section for velocity stretchiness
    for x in range(350, 1150, 90):
        page.mouse.move(x, 480)
        page.wait_for_timeout(25)
    page.screenshot(path=os.path.join(OUT_DIR, "final_3_hero_mouse_stretch.png"))
    print("3. Captured hero mouse movement stretch")

    # 4. Scroll down through Hero scrub (0:10 to 0:12 in video)
    page.evaluate("window.scrollTo(0, 500)")
    page.wait_for_timeout(400)
    page.screenshot(path=os.path.join(OUT_DIR, "final_4_hero_scrub_split.png"))
    print("4. Captured hero scrub split")

    # 5. Scroll to Tagline section & scrub to reveal "BLENDING STRATEGY WITH..."
    # We use page.evaluate to scroll smoothly into the tagline pin
    page.evaluate("""
        const tagline = document.querySelector('.tagline');
        const st = ScrollTrigger.getById('tagline-st') || ScrollTrigger.getAll().find(s => s.trigger === tagline);
        if (st) {
            window.scrollTo(0, st.start + (st.end - st.start) * 0.55);
        } else {
            tagline.scrollIntoView();
            window.scrollBy(0, 450);
        }
    """)
    page.wait_for_timeout(600)
    page.screenshot(path=os.path.join(OUT_DIR, "final_5_tagline_blending_text.png"))
    print("5. Captured tagline blending text")

    # 6. Scroll to Impact section
    page.evaluate("""
        const impact = document.querySelector('.impact');
        impact.scrollIntoView();
        window.scrollBy(0, 350);
    """)
    page.wait_for_timeout(700)
    page.screenshot(path=os.path.join(OUT_DIR, "final_6_impact_running_strip_frame1.png"))
    
    # Wait 1.1s to capture the continuous conveyor movement and odometer counter
    page.wait_for_timeout(1100)
    page.screenshot(path=os.path.join(OUT_DIR, "final_7_impact_running_strip_frame2.png"))
    print("6. Captured impact section continuous strip & counters")

    browser.close()
    print("All final captures completed!")
