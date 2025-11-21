import cdsapi

c = cdsapi.Client()

# This will download one hour of real CAPE data at 0.25° resolution
c.retrieve(
    'reanalysis-era5-single-levels',
    {
        'product_type': 'reanalysis',
        'variable': 'convective_available_potential_energy',
        'year': '2023',
        'month': '07',
        'day': '01',
        'time': '12:00',   # UTC time
        'format': 'netcdf',  # easier to handle than GRIB
    },
    'era5_cape_2023-07-01_12UTC.nc'
)