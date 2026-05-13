from manim import *

class Scene5_Graphicalrepresentationofmotion(Scene):
    def construct(self):
        # This line has the error: escaped quotes
        title = Text("Kinematics", weight=\"BOLD\").scale(1.5)
        self.add(title)
        
        # Test get_graph usage to ensure both patches work? 
        # Actually I just want to test if the string cleaner would fix the file content
        # But I can't run this file directly as python if it has syntax error.
        # I need to simulate the stage2_manim process.

if __name__ == "__main__":
    # Simulate the cleaning logic
    manim_code = """
from manim import *
class SceneTest(Scene):
    def construct(self):
        title = Text("Kinematics", weight=\\"BOLD\\").scale(1.5)
        graph = axes.get_graph(lambda x: x**2)
    """
    
    print("Original Code:")
    print(manim_code)
    
    if ".get_graph(" in manim_code:
        print("⚠️ Replacing .get_graph() with .plot() for compatibility")
        manim_code = manim_code.replace(".get_graph(", ".plot(")

    if '\\"' in manim_code:
        print("⚠️ Removing escaped quotes from Python code")
        manim_code = manim_code.replace('=\\"', '="')
        manim_code = manim_code.replace('\\"', '"') 

    print("\nFixed Code:")
    print(manim_code)
    
    # Check if fixed code is valid python
    try:
        compile(manim_code, "<string>", "exec")
        print("\n✅ Verification Successful: Code is valid Python")
    except SyntaxError as e:
        print(f"\n❌ Verification Failed: {e}")
