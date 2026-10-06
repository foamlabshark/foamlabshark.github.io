# OpenFOAM v2512 migration report

Date: 2026-09-04

Source: `/mnt/hgfs/UbuntuShareFolder/OF9`

Destination: `/home/shark/OpenFOAM/shark-v2512/run/OF_material`

## Migrated directories

- `101postprocessing`
- `advanced_physics`
- `advanced_postprocessing`
- `advanced_SHM`
- `101SHM_basic`

## Main compatibility changes

- Added a v2512 environment bootstrap and case-local working directory to run scripts.
- Updated OpenFOAM dictionary headers and renamed or replaced deprecated entries and utilities.
- Migrated turbulence dictionaries to `momentumTransport`/`turbulenceProperties` where required by the selected v2512 solver.
- Converted legacy `fvModels`/`fvConstraints` examples to OpenCFD v2512 `fvOptions` syntax where necessary.
- Updated multiphase, compressible, buoyant, dynamic-mesh, AMI/MRF, Fluent-import, sampling and function-object dictionaries.
- Updated `surfaceFeatureExtract`, `mergeOrSplitBaffles`, `snappyHexMesh`, `refineMesh`, `topoSet`, `createPatch` and sampling syntax.
- Made all gnuplot workflows headless with PNG output, and updated sampled-data filenames/columns for v2512.
- Added the external mesh assets required by the imported-mesh cases under `meshes_and_geometries`.

## Validation performed

- 49 main `controlDict` files parsed successfully with OpenFOAM v2512.
- 149 target shell scripts passed `bash -n` syntax checking.
- 37 `blockMesh` cases passed `blockMesh` and `checkMesh`.
- 18 surface-feature extraction dictionaries passed `surfaceFeatureExtract`.
- 26 active SHM configurations passed `snappyHexMesh -dry-run` after creating their base meshes and features.
- Representative full meshes were generated and checked for CSTR AMI/MRF, rigid-body, imported Fluent/Plot3D, multiphase and post-processing cases.
- 22 representative solver cases completed a v2512 initialization and at least one solver time step/iteration. Tested solvers include `icoFoam`, `simpleFoam`, `pimpleFoam`, `interFoam`, `twoPhaseEulerFoam`, `sonicFoam`, `rhoPimpleFoam`, `buoyantPimpleFoam` and `buoyantBoussinesqPimpleFoam`.
- Sampling/function-object workflows were run for the pipe and airfoil cases.
- All five gnuplot workflows were checked without Qt/X11 dependencies; representative PNG files were generated.
- No active OF9-era occurrences remain for the migrated keywords checked, including `convertToMeters`, `functionObjectLibs`, `writeCompression uncompressed`, legacy line-sampling types, `transform none`, `surfaceFeatures` and interactive gnuplot terminals.

## Bubble-column correction

The initial `advanced_physics/multiphase/bubble_column` test stalled while looking up the viscous divergence scheme. The cause was an OF9-era regular expression with unescaped multiplication characters in `fvSchemes`. After correcting the expression to the v2512 form, its 25,900-cell mesh completed the first `twoPhaseEulerFoam` time step successfully in about three seconds.

Long production-duration simulations were not run; solver checks used shortened end times and write intervals to validate startup and the first iteration/time step.
