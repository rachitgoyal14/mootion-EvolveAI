import re

def clean_code(manim_code):
    print(f"Original: {manim_code.strip()}")
    # 🔹 Safety Patch for escaped quotes (e.g. weight=\"BOLD\")
    if '\\"' in manim_code:
        # Replace = \" with =" (keyword args, allowing spaces)
        manim_code = re.sub(r'=\s*\\"', '="', manim_code)
        # Replace ( \" with (" (function args, allowing spaces)
        manim_code = re.sub(r'\(\s*\\"', '("', manim_code)
        # Replace \" , with ", (closing quote before comma)
        manim_code = re.sub(r'\\"\s*,', '",', manim_code)
        # Replace \" ) with ") (closing quote before parenthesis)
        manim_code = re.sub(r'\\"\s*\)', '")', manim_code)
    print(f"Fixed:    {manim_code.strip()}")
    return manim_code

# Test Cases
test_1 = 'title = Text("Kinematics", weight=\\"BOLD\\").scale(1.5)' # Standard error

print("--- Test 1 ---")
fixed_1 = clean_code(test_1)
if 'weight="BOLD"' in fixed_1:
    print("✅ Match found")
else:
    print("❌ Match NOT found")
    print(f"Expected snippet: weight=\"BOLD\"")
    print(f"Actual string: {fixed_1}")

# Check individual regex parts
s = 'weight=\\"BOLD'
print(f"\nSub-test A: '{s}'")
r1 = re.sub(r'=\s*\\"', '="', s)
print(f"Regex 1 result: '{r1}'")

s2 = 'BOLD\\")'
print(f"\nSub-test B: '{s2}'")
r2 = re.sub(r'\\"\s*\)', '")', s2)
print(f"Regex 2 result: '{r2}'")
