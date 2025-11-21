import cdsapi

c = cdsapi.Client()

# Download one hour of real CAPE data over a London-sized box at 0.25° resolution
c.retrieve(
    'reanalysis-era5-single-levels',
    {
        'product_type': 'reanalysis',
        'variable': 'convective_available_potential_energy',
        'year': '2025',
        'month': '10',
        'day': '01',
        'time': '12:00',        # UTC
        'format': 'netcdf',     # easier to handle than GRIB

        # Area: [North, West, South, East]
        # This box roughly covers London and surroundings.
        'area': [
            52.5,   # North  (≈ just north of London)
            -1.5,   # West   (≈ west of London)
            50.5,   # South  (≈ south of London)
            1.5     # East   (≈ east of London)
        ],
    },
    'era5_cape_2025-10-01_12UTC_london.nc'
)