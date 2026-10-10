"""Reproduce the numerical examples in FoamLab's dimensionless-number article.

Python 3; standard library only. All inputs are in SI units.
The printed values are calculations from prescribed inputs, not CFD results.
"""
from math import sqrt

PIPE = dict(length=0.02, speed=0.5, rho=1000.0, mu=0.001,
            conductivity=0.6, cp=4180.0, dx=0.0005, dt=0.0002,
            assumed_nusselt=80.0)
BUBBLE = dict(diameter=0.001, relative_speed=0.2, rho_liquid=1000.0,
              rho_gas=1.0, mu_liquid=0.001, sigma=0.072, g=9.81)
CONVECTION = dict(length=0.1, delta_t=20.0, nu=1.5e-5,
                  alpha=2.2e-5, beta=1.0 / 300.0, g=9.81,
                  forced_speed=0.5)
REACTION = dict(length=0.001, speed=0.01, nu=1e-6,
                diffusivity=1e-9, first_order_rate=1.0)


def pipe(p):
    nu = p["mu"] / p["rho"]
    alpha = p["conductivity"] / (p["rho"] * p["cp"])
    re = p["speed"] * p["length"] / nu
    pr = nu / alpha
    return dict(nu=nu, alpha=alpha, Re=re, Pr=pr, Pe_heat=re * pr,
                h_from_assumed_Nu=p["assumed_nusselt"] * p["conductivity"] / p["length"],
                Co=p["speed"] * p["dt"] / p["dx"],
                Pe_cell_heat=p["speed"] * p["dx"] / alpha,
                Fo_cell=alpha * p["dt"] / p["dx"] ** 2)


def bubble(p):
    d, u = p["diameter"], p["relative_speed"]
    rho, mu, sigma = p["rho_liquid"], p["mu_liquid"], p["sigma"]
    return dict(Re=rho * u * d / mu, We=rho * u * u * d / sigma,
                Ca=mu * u / sigma,
                Bo=abs(rho - p["rho_gas"]) * p["g"] * d * d / sigma,
                Oh=mu / sqrt(rho * sigma * d))


def convection(p):
    gr = p["g"] * p["beta"] * p["delta_t"] * p["length"] ** 3 / p["nu"] ** 2
    pr = p["nu"] / p["alpha"]
    re = p["forced_speed"] * p["length"] / p["nu"]
    return dict(Pr=pr, Gr=gr, Ra=gr * pr, Re_forced=re, Ri=gr / re ** 2,
                beta_deltaT=p["beta"] * p["delta_t"])


def reaction(p):
    tau_adv = p["length"] / p["speed"]
    tau_diff = p["length"] ** 2 / p["diffusivity"]
    tau_rxn = 1.0 / p["first_order_rate"]
    return dict(Re=p["speed"] * p["length"] / p["nu"],
                Sc=p["nu"] / p["diffusivity"],
                Pe_mass=p["speed"] * p["length"] / p["diffusivity"],
                advection_time_s=tau_adv, diffusion_time_s=tau_diff,
                reaction_time_s=tau_rxn,
                Da_advection=tau_adv / tau_rxn, Da_diffusion=tau_diff / tau_rxn)


def results():
    return {
        "1. Heated water pipe": pipe(PIPE),
        "2. Water-air bubble, diameter 1 mm": bubble(BUBBLE),
        "2b. Bubble, diameter increased tenfold": bubble(dict(BUBBLE, diameter=0.01)),
        "3. Heated vertical wall": convection(CONVECTION),
        "4. Solute transport and first-order reaction": reaction(REACTION),
        "5. Ship model at equal Froude number": {
            "length_ratio": 0.25, "speed_ratio": sqrt(0.25),
            "Re_ratio_same_fluid": 0.25 * sqrt(0.25)}
    }


if __name__ == "__main__":
    for title, values in results().items():
        print("\n" + title)
        for name, value in values.items():
            print(f"  {name:30s} = {value:.9g}")
