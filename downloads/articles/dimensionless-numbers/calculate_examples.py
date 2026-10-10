"""Reproduce the numerical examples in FoamLab's dimensionless-number article.

Python 3; standard library only. All inputs are in SI units.
The printed values are calculations from prescribed inputs, not CFD results.
"""
from math import exp, sqrt

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


def teaching_examples():
    """Small/large-value comparisons used in the illustrated explanations."""
    out = {}
    for label, length, speed in [("microchannel", 0.0001, 0.001), ("water pipe", 0.02, 0.5)]:
        out["Reynolds time scales: " + label] = dict(
            Re=speed * length / 1e-6, advection_time_s=length / speed,
            viscous_time_s=length**2 / 1e-6)
    for speed in [0.2, 2.0]:
        wave_speed = sqrt(9.81 * 0.1)
        out[f"Shallow-water waves, U={speed} m/s"] = dict(
            c_m_per_s=wave_speed, Fr=speed / wave_speed,
            upstream_branch_m_per_s=speed - wave_speed,
            downstream_branch_m_per_s=speed + wave_speed)
    for pe in [0.1, 100.0]:
        out[f"Peclet spreading, Pe={pe}"] = dict(diffusion_length_over_L=1 / sqrt(pe))
    out["Diffusion lengths at t=0.1 s"] = dict(
        momentum_mm=sqrt(1e-6 * 0.1) * 1000, heat_mm=sqrt(1.4e-7 * 0.1) * 1000,
        species_mm=sqrt(1e-9 * 0.1) * 1000, Pr=1e-6 / 1.4e-7, Sc=1000)
    for nu_number in [10, 80]:
        h = nu_number * 0.6 / 0.02
        out[f"Heat transfer, Nu={nu_number}"] = dict(h_W_per_m2_K=h, heat_flux_W_per_m2=h * 20)
    for conductivity in [200.0, 0.2]:
        out[f"Solid cooling, k={conductivity} W/(m K)"] = dict(Bi=100 * 0.005 / conductivity)
    for elapsed in [0.01, 10.0]:
        out[f"Thermal diffusion, t={elapsed} s"] = dict(
            Fo=1e-5 * elapsed / 0.005**2, diffusion_length_mm=sqrt(1e-5 * elapsed) * 1000)
    for speed in [0.05, 0.5, 5.0]:
        out[f"Mixed convection, U={speed} m/s"] = dict(Ri=9.81 / 300 * 20 * 0.1 / speed**2)
    for da in [0.1, 1.0, 10.0]:
        out[f"First-order plug flow, Da={da}"] = dict(conversion_percent=(1 - exp(-da)) * 100)
    for sh in [2.0, 20.0]:
        out[f"Mass transfer, Sh={sh}"] = dict(km_m_per_s=sh * 1e-9 / 0.001)
    for tau in [0.01, 1.0]:
        out[f"Stokes response, relaxation={tau} s"] = dict(
            Stk=tau / 0.1, velocity_percent_at_0_1s=(1 - exp(-0.1 / tau)) * 100)
    for dt in [0.0002, 0.002]:
        out[f"Time step, dt={dt} s"] = dict(Co=dt / 0.001, displacement_mm=dt * 1000)
    return out


if __name__ == "__main__":
    for title, values in {**results(), **teaching_examples()}.items():
        print("\n" + title)
        for name, value in values.items():
            print(f"  {name:30s} = {value:.9g}")
