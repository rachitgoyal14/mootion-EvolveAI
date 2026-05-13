from manim import *

class Scene5_Graphicalrepresentationofmotion(Scene):
    def construct(self):
        axes = Axes(
            x_range=[0, 10, 1],
            y_range=[0, 10, 1],
            x_length=8,
            y_length=6,
            axis_config={"include_tip": True},
            tips=False
        )
        axes_labels = axes.get_axis_labels(x_label="t", y_label="x(t)")
        self.play(Create(axes), Write(axes_labels))
        self.wait(1)

        # Define position function x(t) = 0.5 t^2
        def position_func(t):
            return 0.5 * t ** 2

        graph = axes.plot(position_func, x_range=[0, 8], color=BLUE)
        self.play(Create(graph))
        self.wait(1)

        moving_dot = Dot(color=RED)
        self.add(moving_dot)

        # Animate dot moving along the curve
        for t in range(0, 9):
            new_pos = axes.c2p(t, position_func(t))
            self.play(moving_dot.animate.move_to(new_pos), run_time=0.5)

        # Draw tangent line at t=6 to highlight slope (velocity)
        t0 = 6
        x0 = t0
        y0 = position_func(t0)
        slope = t0  # derivative of 0.5 t^2 is t

        # Tangent line: y - y0 = slope (x - x0)
        # REPLACED get_graph WITH plot HERE
        tangent_line = axes.plot(lambda x: slope * (x - x0) + y0, x_range=[t0 - 1, t0 + 1], color=YELLOW)
        slope_label = MathTex(r"v = \frac{dx}{dt} = t", font_size=36).to_edge(UP)

        self.play(Create(tangent_line), Write(slope_label))
        self.wait(3)
