# OpenFOAM v2512 migration

This directory targets the OpenCFD OpenFOAM **v2512** installation.

## Environment

Load v2512 before running a case if it is not already active:

```bash
source /usr/lib/openfoam/openfoam2512/etc/bashrc
foamVersion
```

`foamVersion` must report `v2512`.

Every `run_*.sh` script now changes to its own case directory, uses strict Bash
error handling, and can therefore be launched from any working directory.
OpenFOAM failures hidden behind `tee` are propagated to the caller. Plotting is
optional: when `gnuplot` is unavailable, numerical calculation and sampling
still complete and plotting is skipped with a message.

## Main entry points

- `2D_damBreak/run_solver.sh`
- `cavity2D-variants/*/*/run_all.sh`
- `cavity3D/run_solver.sh` or `cavity3D/run_solver_parallel.sh`
- `hairpin_vortices/ste_coarse/run_all.sh`
- `hairpin_vortices/uns_coarse/run_solver.sh`
- `hairpin_vortices/uns_fine/run_mesh.sh`, followed by
  `hairpin_vortices/uns_fine/run_solver.sh`
- `hairpin_vortices/uns_fine/run_solver_mapping.sh` for the alternative Fluent
  fine-mesh and mapped-initial-condition workflow
- `laminar_pipe/case*/run_solver.sh`

The run scripts call `foamCleanTutorials` and remove previous generated time or
processor directories. Preserve results elsewhere before rerunning a case.

## v2512 changes

- Updated removed OF9 function-object include paths to v2512 equivalents.
- Restored the v2512 `interFoam` alpha-compression discretisation entries.
- Replaced deprecated `convertToMeters` and `uncompressed` values with `scale`
  and `off`.
- Migrated `surfaceFeatures` and its dictionary to v2512
  `surfaceFeatureExtract` syntax.
- Corrected the `uns_fine` Fluent conversion to use `fine.msh` and its transient
  solver script to use `pimpleFoam`.
- Updated v2512 sampling filenames and column indices in every gnuplot script
  and laminar-pipe notebook. Gnuplot now selects the latest sampled time and
  writes PNG files with `pngcairo`, so plotting works without an X display.
- Added non-interactive dam-break probe plots for `alpha.water` and `p_rgh`.
  The unavailable on-disk `p` probe was removed.
- Migrated laminar-pipe notebook metadata from Python 2 to Python 3.
- Removed unused Foundation-OF9 `momentumTransport.OF9` alternatives. v2512's
  legacy solver applications in these cases read `turbulenceProperties`.

## Validation performed

The migration was tested locally with OpenFOAM v2512:

- all 7 cavity variants: `blockMesh`, solver one-step checks, and sampling;
- all 4 laminar-pipe variants: mesh generation, `modifyMesh` where applicable,
  solver one-step checks, and sampling;
- dam-break: `blockMesh`, `setFields`, and `interFoam` one-step check;
- steady hairpin: serial snappy mesh, `checkMesh`, serial solve, and a 4-rank MPI
  solve;
- unsteady coarse hairpin: Fluent conversion and a transient solve step;
- unsteady fine hairpin: 4-rank snappy mesh, reconstruction, repartitioning,
  renumbering, and a 4-rank transient solve step;
- alternative Fluent fine mesh: conversion, `checkMesh`, `mapFields`, and a
  `pimpleFoam` setup/one-step check.
- all 16 gnuplot scripts executed headlessly and produced valid PNG files; all
  four active laminar-pipe notebook plotting programs executed with Python 3.

The alternative Fluent fine mesh contains 3,803,904 cells and 11,827,716 faces.
Its `checkMesh` used roughly 5.2 GB of RAM locally, so allow adequate memory for
full production runs.
