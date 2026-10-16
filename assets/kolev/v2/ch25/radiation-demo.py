"""Independent radiation examples; Python 3 with NumPy and SciPy. Not an OpenFOAM run."""
import json,math
from pathlib import Path
from scipy.integrate import quad
import numpy as np

H_PLANCK=6.62607015e-34
C_LIGHT=299792458.0
K_B=1.380649e-23
C1=H_PLANCK*C_LIGHT**2
C2=H_PLANCK*C_LIGHT/K_B
SIGMA=2*math.pi**5*C1/(15*C2**4)

def band_fraction(T,lo,hi):
    """Fraction of full blackbody emission within [lo, hi], wavelengths in metres."""
    def integrand(x):
        if x==0:return 0.0
        return x**3*math.exp(-x)/(-math.expm1(-x))
    return 15/math.pi**4*quad(integrand,C2/(hi*T),C2/(lo*T),epsabs=1e-12,epsrel=1e-12)[0]

def step_absorber(cells,beta=2.0,length=1.0,incoming=1.0,blackbody=.1):
    """s_x=1; implicit upwind FV balance, constant absorption/emission, unit area."""
    dx=length/cells;intensity=incoming;absorbed=0.;max_residual=0.
    for _ in range(cells):
        previous=intensity
        intensity=(previous+beta*dx*blackbody)/(1+beta*dx)
        sink=beta*dx*(intensity-blackbody)
        max_residual=max(max_residual,abs(previous-intensity-sink));absorbed+=sink
    exact=blackbody+(incoming-blackbody)*math.exp(-beta*length)
    return dict(cells=cells,outgoing=intensity,exact=exact,error=abs(intensity-exact),net_absorption=absorbed,balance_error=abs(incoming-intensity-absorbed),max_cell_residual=max_residual)

def run():
    bands=[(.7e-6,1.2e-6),(1.2e-6,1.8e-6),(1.8e-6,20e-6)]
    spectra=[]
    for T in [1000,2500,3500]:
        fractions=[band_fraction(T,*b) for b in bands]
        spectra.append(dict(temperature_K=T,fractions=fractions,omitted_fraction=1-sum(fractions)))
    fv=[step_absorber(n) for n in [20,40,80,160,320]]
    for r in fv:
        assert r['balance_error']<1e-12 and r['max_cell_residual']<1e-12
    assert all(fv[i+1]['error']<fv[i]['error'] for i in range(len(fv)-1))
    for n in [10,100,1000]:
        r=step_absorber(n,incoming=.1,blackbody=.1)
        assert abs(r['outgoing']-.1)<1e-13
    # A two-band incident beam, with anti-correlated attenuation in two layers.
    incoming=np.ones(2);t1=np.array([.1,.9]);t2=np.array([.9,.1])
    exact=float(np.mean(incoming*t1*t2));grey=float(np.mean(t1)*np.mean(t2))
    report=dict(independent_python_verification=True,openfoam_run=False,
                inputs=dict(c1=C1,c2=C2,sigma=SIGMA,bands_m=bands,beta_per_m=2,length_m=1,incoming=1,medium_intensity=.1),
                blackbody_bands=spectra,finite_volume_refinement=fv,
                two_band_filter=dict(exact=exact,product_of_means=grey),passed=True)
    return report

if __name__=='__main__':
    report=run()
    target=Path(__file__).with_name('radiation-results.json')
    target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
