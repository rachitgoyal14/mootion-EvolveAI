from manim import *

class Scene1_Ionic_bonds_formation_by_electron_transfer(Scene):
    def construct(self):
        # Atoms as circles
        atom1 = Circle(radius=1, color=BLUE).shift(LEFT * 3)
        atom2 = Circle(radius=1, color=RED).shift(RIGHT * 3)

        # Electrons as small dots
        electron1 = Dot(point=atom1.get_center() + RIGHT * 0.7, color=YELLOW)

        # Highlight electron1
        electron1_highlight = electron1.copy().set_stroke(color=YELLOW, width=4)

        # Arrow indicating electron transfer
        transfer_arrow = Arrow(start=electron1.get_center(), end=atom2.get_center() + LEFT * 0.7, buff=0.1, color=YELLOW)

        # Positive ion (atom1 with plus sign)
        plus_sign = MathTex(r"+").set_color(RED).scale(1.5).next_to(atom1, UP)

        # Negative ion (atom2 with minus sign)
        minus_sign = MathTex(r"-").set_color(BLUE).scale(1.5).next_to(atom2, UP)

        # Arrow showing attraction between ions
        attraction_arrow = Arrow(start=atom1.get_center() + RIGHT * 1, end=atom2.get_center() + LEFT * 1, buff=0.1, color=GREEN)

        # Initial scene: show atoms and electron
        self.play(Create(atom1), Create(atom2))
        self.wait(1)
        self.play(FadeIn(electron1), Create(electron1_highlight))
        self.wait(1)

        # Show electron transfer arrow
        self.play(Create(transfer_arrow))
        self.wait(1)

        # Animate electron moving from atom1 to atom2
        self.play(Transform(electron1, Dot(point=atom2.get_center() + LEFT * 0.7, color=YELLOW)))
        self.wait(1)

        # Remove highlight and transfer arrow
        self.play(FadeOut(electron1_highlight), FadeOut(transfer_arrow))

        # Show ions with charges
        self.play(Transform(atom1, Circle(radius=1, color=RED)), Write(plus_sign))
        self.play(Transform(atom2, Circle(radius=1, color=BLUE)), Write(minus_sign))
        self.wait(1)

        # Show attraction arrow
        self.play(Create(attraction_arrow))
        self.wait(2)

class Scene2_Examples_of_ionic_compounds(Scene):
    def construct(self):
        # Na+ and Cl- ions
        na = Circle(radius=0.8, color=BLUE).shift(LEFT * 4 + UP * 1)
        na_label = MathTex(r"Na^{+}").move_to(na.get_center())

        cl = Circle(radius=0.8, color=RED).shift(LEFT * 2 + UP * 1)
        cl_label = MathTex(r"Cl^{-}").move_to(cl.get_center())

        # Dotted line indicating ionic bond
        ionic_bond1 = DashedLine(start=na.get_right(), end=cl.get_left(), color=YELLOW)

        # NaCl formula
        nacl_formula = MathTex(r"NaCl").shift(LEFT * 3 + UP * 2.5)

        # Ca2+ and CO3 2- ions
        ca = Circle(radius=0.8, color=BLUE).shift(RIGHT * 2 + DOWN * 0.5)
        ca_label = MathTex(r"Ca^{2+}").move_to(ca.get_center())

        co3 = Circle(radius=1.2, color=RED).shift(RIGHT * 4 + DOWN * 0.5)
        co3_label = MathTex(r"CO_3^{2-}").move_to(co3.get_center())

        # Dotted line indicating ionic bond between Ca2+ and CO3 2-
        ionic_bond2 = DashedLine(start=ca.get_right(), end=co3.get_left(), color=YELLOW)

        # CaCO3 formula
        caco3_formula = MathTex(r"CaCO_3").shift(RIGHT * 3 + UP * 1.5)

        # Group Na+ and Cl- with bond
        group1 = VGroup(na, na_label, cl, cl_label, ionic_bond1, nacl_formula)

        # Group Ca2+ and CO3 2- with bond
        group2 = VGroup(ca, ca_label, co3, co3_label, ionic_bond2, caco3_formula)

        # Show NaCl group
        self.play(Create(na), Write(na_label))
        self.play(Create(cl), Write(cl_label))
        self.wait(1)
        self.play(Create(ionic_bond1))
        self.play(Write(nacl_formula))
        self.wait(2)

        # Show CaCO3 group
        self.play(Create(ca), Write(ca_label))
        self.play(Create(co3), Write(co3_label))
        self.wait(1)
        self.play(Create(ionic_bond2))
        self.play(Write(caco3_formula))
        self.wait(2)

class Scene3_Covalent_bonds_formed_by_electron_sharing(Scene):
    def construct(self):
        # Two atoms as circles
        atom1 = Circle(radius=1, color=BLUE).shift(LEFT * 3)
        atom2 = Circle(radius=1, color=RED).shift(RIGHT * 3)

        # Electrons as dots near each atom
        electron1 = Dot(point=atom1.get_center() + RIGHT * 0.7, color=YELLOW)
        electron2 = Dot(point=atom2.get_center() + LEFT * 0.7, color=YELLOW)

        # Show atoms and electrons
        self.play(Create(atom1), Create(atom2))
        self.play(FadeIn(electron1), FadeIn(electron2))
        self.wait(1)

        # Animate atoms approaching each other
        self.play(atom1.animate.shift(RIGHT * 1.5), atom2.animate.shift(LEFT * 1.5))
        self.wait(1)

        # Animate electrons moving to shared space
        shared_pos = (atom1.get_center() + atom2.get_center()) / 2
        self.play(electron1.animate.move_to(shared_pos + UP * 0.1), electron2.animate.move_to(shared_pos + DOWN * 0.1))
        self.wait(1)

        # Highlight shared electron pair as bond (line between atoms)
        bond = Line(start=atom1.get_center() + RIGHT * 0.5, end=atom2.get_center() + LEFT * 0.5, color=YELLOW, stroke_width=6)
        self.play(Create(bond))
        self.wait(2)

class Scene4_Examples_of_covalent_molecules(Scene):
    def construct(self):
        # H2 molecule
        h1 = Circle(radius=0.6, color=BLUE).shift(LEFT * 5 + UP * 1)
        h1_label = MathTex(r"H").move_to(h1.get_center())
        h2 = Circle(radius=0.6, color=BLUE).shift(LEFT * 4 + UP * 1)
        h2_label = MathTex(r"H").move_to(h2.get_center())
        bond_h2 = Line(h1.get_right(), h2.get_left(), color=WHITE, stroke_width=4)

        # O2 molecule
        o1 = Circle(radius=0.8, color=RED).shift(LEFT * 1 + UP * 1)
        o1_label = MathTex(r"O").move_to(o1.get_center())
        o2 = Circle(radius=0.8, color=RED).shift(LEFT * 0 + UP * 1)
        o2_label = MathTex(r"O").move_to(o2.get_center())
        bond_o2 = Line(o1.get_right(), o2.get_left(), color=WHITE, stroke_width=4)

        # H2O molecule
        o = Circle(radius=0.8, color=RED).shift(RIGHT * 3 + UP * 0.5)
        o_label = MathTex(r"O").move_to(o.get_center())
        h3 = Circle(radius=0.6, color=BLUE).shift(RIGHT * 2 + UP * 1.5)
        h3_label = MathTex(r"H").move_to(h3.get_center())
        h4 = Circle(radius=0.6, color=BLUE).shift(RIGHT * 4 + UP * 1.5)
        h4_label = MathTex(r"H").move_to(h4.get_center())

        bond_oh1 = Line(o.get_left(), h3.get_right(), color=WHITE, stroke_width=4)
        bond_oh2 = Line(o.get_right(), h4.get_left(), color=WHITE, stroke_width=4)

        # Show H2
        self.play(Create(h1), Write(h1_label))
        self.play(Create(h2), Write(h2_label))
        self.play(Create(bond_h2))
        self.wait(2)

        # Show O2
        self.play(Create(o1), Write(o1_label))
        self.play(Create(o2), Write(o2_label))
        self.play(Create(bond_o2))
        self.wait(2)

        # Show H2O
        self.play(Create(o), Write(o_label))
        self.play(Create(h3), Write(h3_label))
        self.play(Create(h4), Write(h4_label))
        self.play(Create(bond_oh1), Create(bond_oh2))
        self.wait(2)

class Scene5_Organic_compounds_contain_carbon_and_hydrogen_with_covalent_bonds(Scene):
    def construct(self):
        # Carbon atom
        c = Circle(radius=1, color=GRAY).shift(LEFT * 4)
        c_label = MathTex(r"C").move_to(c.get_center())

        # Four hydrogen atoms around carbon
        h_positions = [UP + LEFT, UP + RIGHT, DOWN + LEFT, DOWN + RIGHT]
        hydrogens = VGroup()
        bonds = VGroup()
        for pos in h_positions:
            h_atom = Circle(radius=0.6, color=BLUE).move_to(c.get_center() + pos * 1.8)
            h_label = MathTex(r"H").move_to(h_atom.get_center())
            hydrogens.add(h_atom, h_label)
            bond = Line(c.get_center() + pos * 0.8, h_atom.get_center() + (-pos) * 0.2, color=WHITE, stroke_width=4)
            bonds.add(bond)

        # Show methane structure
        self.play(Create(c), Write(c_label))
        for i in range(0, len(hydrogens), 2):
            self.play(Create(hydrogens[i]), Write(hydrogens[i+1]))
        self.wait(1)
        for bond in bonds:
            self.play(Create(bond))
        self.wait(2)

        # Show molecular formulas
        ch4 = MathTex(r"CH_4").shift(LEFT * 4 + DOWN * 3)
        c6h12o6 = MathTex(r"C_6H_{12}O_6").shift(LEFT * 0 + DOWN * 3)
        c10h16 = MathTex(r"C_{10}H_{16}").shift(RIGHT * 4 + DOWN * 3)

        self.play(Write(ch4))
        self.wait(1)
        self.play(Write(c6h12o6))
        self.wait(1)
        self.play(Write(c10h16))
        self.wait(2)

class Scene6_Clarification_that_organic_bond_is_a_category_not_a_bond_type(Scene):
    def construct(self):
        # Text
        text = Tex(r"Organic bond = category of compounds containing C and H").to_edge(UP)

        # Diagram: several organic molecules connected by covalent bonds
        # Simplified: three carbon atoms connected linearly with hydrogens
        c1 = Circle(radius=0.8, color=GRAY).shift(LEFT * 3)
        c1_label = MathTex(r"C").move_to(c1.get_center())
        c2 = Circle(radius=0.8, color=GRAY).shift(LEFT * 1)
        c2_label = MathTex(r"C").move_to(c2.get_center())
        c3 = Circle(radius=0.8, color=GRAY).shift(RIGHT * 1)
        c3_label = MathTex(r"C").move_to(c3.get_center())

        bond1 = Line(c1.get_right(), c2.get_left(), color=WHITE, stroke_width=4)
        bond2 = Line(c2.get_right(), c3.get_left(), color=WHITE, stroke_width=4)

        # Hydrogens around c2
        h1 = Circle(radius=0.5, color=BLUE).shift(LEFT * 1 + UP * 1.8)
        h1_label = MathTex(r"H").move_to(h1.get_center())
        bond_h1 = Line(c2.get_top(), h1.get_bottom(), color=WHITE, stroke_width=3)

        h2 = Circle(radius=0.5, color=BLUE).shift(LEFT * 1 + DOWN * 1.8)
        h2_label = MathTex(r"H").move_to(h2.get_center())
        bond_h2 = Line(c2.get_bottom(), h2.get_top(), color=WHITE, stroke_width=3)

        # Highlight text "bonds are covalent, not a new bond type"
        highlight_text = Tex(r"Bonds are covalent, not a new bond type").to_edge(DOWN).set_color(YELLOW)

        # Show text
        self.play(Write(text))
        self.wait(2)

        # Show carbon atoms and bonds
        self.play(Create(c1), Write(c1_label))
        self.play(Create(c2), Write(c2_label))
        self.play(Create(c3), Write(c3_label))
        self.wait(1)
        self.play(Create(bond1), Create(bond2))
        self.wait(1)

        # Show hydrogens and bonds
        self.play(Create(h1), Write(h1_label))
        self.play(Create(h2), Write(h2_label))
        self.play(Create(bond_h1), Create(bond_h2))
        self.wait(2)

        # Show highlight text
        self.play(Write(highlight_text))
        self.wait(3)
