#!/bin/bash

rm -rf customer-service-proto
git clone git@github.com:sbasestarter/customer-service-proto.git
cp -rf  customer-service-proto/gens/js ./
rm -rf customer-service-proto