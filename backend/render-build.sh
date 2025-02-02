#!/bin/bash

# Install Java (Amazon Corretto 17)
export JAVA_HOME=/opt/render/.java/current
export PATH=$JAVA_HOME/bin:$PATH

# Verify Java Installation
java -version

# Run Maven Build
./mvnw package