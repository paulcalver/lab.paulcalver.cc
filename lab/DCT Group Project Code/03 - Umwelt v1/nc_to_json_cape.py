import xarray as xr
import json

# Open the NetCDF file you downloaded
ds = xr.open_dataset("era5_cape_2025-10-01_12UTC_london.nc")

# Inspect what we've got (optional but useful once)
print("Data variables:", list(ds.data_vars))
print("Dimensions:", ds.dims)

# ERA5 CAPE variable
cape = ds["cape"]

# Handle the time-like dimension (could be 'time' or 'valid_time')
time_dim = None
for cand in ["time", "valid_time"]:
    if cand in cape.dims:
        time_dim = cand
        break

if time_dim is None:
    raise ValueError(f"No time-like dimension found in CAPE dims: {cape.dims}")

print("Using time dimension:", time_dim)

# Take the first timestep
cape_2d = cape.isel({time_dim: 0})

# Ensure latitude is sorted from south → north
if "latitude" in cape_2d.coords:
    cape_2d = cape_2d.sortby("latitude")

print("CAPE 2D shape:", cape_2d.shape)  # should be (721, 1440) for ERA5 0.25°

# Convert to plain Python list-of-lists
cape_list = cape_2d.values.tolist()

# Dump to JSON
out_file = "cape-london.json"
with open(out_file, "w") as f:
    json.dump(cape_list, f)

print("Wrote:", out_file)