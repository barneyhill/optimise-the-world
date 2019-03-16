# Physical Gradient Descent
Execute gradient descent on a terrain function of the world!
<p align="center">
  <img width: 100% height: auto src="https://github.com/barneyhill/gradient-descent/blob/master/website.gif?raw=true">
</p>

## Overview
With the aim of developing intuition in how gradient descent works, my project allows users to execute gradient descent on a terrain function of the world. Users are able to change the algorithm and variables as well as inspect the path of the algorithm through a graph and an interactive map interface. Project requires a elevation dataset in the form of .hgt files.
## Features
* Option for classical or momentum gradient descent
* Interactive map interface
* Asynchronous node server calculates path within milliseconds
* Graph displays elevation change over each iteration
## Development
Website was developed for OCR Computer Science Coursework over a period of 6 months. Hopefully I will be able to publish my 18k word writeup of the project, which justifies all design decisions made, in the near future.
## Dataset
The dataset ([STRM V3](https://lpdaac.usgs.gov/about/news_archive/nasa_shuttle_radar_topography_mission_srtm_version_30_srtm_plus_product_release)), which ended up being around 55GB can be installed through [this script](https://github.com/barneyhill/srtm-download/blob/master/download.py)
