"""One-dimensional finite-volume verification, not an OpenFOAM run.

python wall-condensation.py --output wall-results.json
Requires numpy/scipy. All inputs use SI. Constant properties are explicitly
supplemental inputs, not an assertion about unpublished historical case data.
"""
import json,argparse,math
from pathlib import Path
import numpy as np
from scipy.linalg import solve_banded
from scipy.optimize import brentq

def solve(composite=True,dx=.005,dt=5.,end=7200.):
    length=1.05;n=round(length/dx);dx=length/n
    z=(np.arange(n)+.5)*dx;steel=(z<.10) if composite else np.zeros(n,dtype=bool)
    k=np.where(steel,45.,1.4);rho=np.where(steel,7850.,2300.);cp=np.where(steel,470.,880.)
    capacity=rho*cp*dx;T=np.full(n,323.15);T0=T.copy();Ts=373.15
    # Saturated water at 100 C: fixed values from IAPWS-IF97.
    rl=958.354277;rg=.59813599;mu=.00028158502;lam=.67721684;latent=2256472.875
    height=10.;grav=9.80665
    coeff=2*math.sqrt(2)/3*(rl*(rl-rg)*lam**3*grav*latent/(height*mu))**.25
    conductance=1/(dx/(2*k[:-1])+dx/(2*k[1:]));Rhalf=dx/(2*k[0])
    base_diag=np.zeros(n);base_diag[:-1]+=conductance;base_diag[1:]+=conductance
    total=0.;data=[];max_balance=0.;prev=0.
    target=np.unique(np.r_[np.arange(0,end+dt,dt),[10,30,100,300,1800,3600,end]])
    target=target[(target>0)&(target<=end)]
    # Exact equilibrium between a frozen linear wall step and nonlinear boundary.
    for t in target:
        step=t-prev;prev=t;ab=np.zeros((3,n));ab[1]=capacity/step+base_diag;ab[0,1:]=-conductance;ab[2,:-1]=-conductance
        b=capacity/step*T
        free=solve_banded((1,1),ab,b);unit=np.zeros(n);unit[0]=1;response=solve_banded((1,1),ab,unit)
        def residual(q):
            wall=free[0]+q*(response[0]+Rhalf)
            return q-coeff*max(Ts-wall,0.)**.75
        upper=max((Ts-free[0])/(response[0]+Rhalf),0.)
        q=brentq(residual,0,upper,xtol=1e-9,rtol=1e-13) if upper>0 else 0.
        T=free+q*response;tw=T[0]+q*Rhalf
        total+=q*step;energy=float(np.dot(capacity,T-T0));balance=energy-total
        max_balance=max(max_balance,abs(balance)/max(total,1.))
        re=height*q/(mu*latent)
        delta=(3*(mu/rl)**2/(grav*(1-rg/rl)))**(1/3)*re**(1/3)
        if len(data)<2 or t in [10,30,100,300,1800,3600,end] or int(t)%60==0:
            data.append(dict(t=float(t),Tw=float(tw),q=float(q),Re_delta=float(re),delta=float(delta),energy=energy,cumulative_heat=float(total),temperatures=[float(np.interp(d,z,T)) for d in [0,.0125,.0375,.0625,.0875,.1125]],balance=balance))
    return dict(composite=bool(composite),dx=dx,dt=dt,properties=dict(steel=[7850,470,45],concrete=[2300,880,1.4],water=[rl,rg,mu,lam,latent]),model='Nusselt laminar diagnostic including out-of-range early steps',max_energy_relative_error=max_balance,final_profile=dict(z=z.tolist(),T=T.tolist()),history=data)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--output',default='wall-results.json');a=p.parse_args()
    report=dict(openfoam_run=False,units='SI',results=[solve(True),solve(False)],refinements=[solve(True,.0025,2.5),solve(False,.0025,2.5),solve(True,.00125,1.25),solve(False,.00125,1.25)])
    Path(a.output).write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8');print(json.dumps(dict(output=a.output,energy_errors=[r['max_energy_relative_error'] for r in report['results']])))
