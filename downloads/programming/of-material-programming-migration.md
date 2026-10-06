# OpenFOAM v2512 migration

This directory has been migrated from OpenFOAM Foundation 9 to OpenCFD
OpenFOAM v2512.

## Build

```bash
cd "$HOME/OpenFOAM/shark-v2512/run/101programming"
./Allwmake
```

The build script loads `/usr/lib/openfoam/openfoam2512/etc/bashrc` when the
v2512 environment is not already active. It builds all 143 `Make/files`
targets.

## Run examples

Each solver case retains its local `run_solver.sh`. The scripts now change to
their own directory, stop on errors, and use non-interactive PNG plotting.
Cases that import meshes expect the migrated mesh inputs in the sibling
directory:

```text
../meshes_and_geometries/
```

For example:

```bash
cd codeStream_BC/2Delbow_UparabolicInlet
./run_solver.sh
```

## v2512 changes

- Updated changed C++ APIs, solver loops, field mapping, dictionary lookup and
  output APIs.
- Ported `cvsimple` from Foundation `fvModels/fvConstraints` usage to OpenCFD
  `fvOptions`.
- Updated legacy dictionary entries such as `convertToMeters`, sampling set
  types, function-object libraries, field-value operations and compression.
- Renamed and ported `surfaceFeatureExtractDict`.
- Replaced interactive Qt gnuplot terminals with file-based PNG output.
- Replaced Foundation test programs with their v2512 counterparts where the
  original API or test was removed.

Migration validation: all 143 build targets compiled with v2512; custom
solvers, coded boundary/initial-condition cases, imported-mesh cases, sampling
and plotting were exercised on local temporary copies.
