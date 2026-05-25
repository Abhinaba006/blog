#!/bin/bash

# Blog Application - Environment Setup Guide

## Starting the application with different configurations

# Development (Full debugging with DEBUG logs)
echo "Starting in DEVELOPMENT mode..."
npx env-cmd -f ./config/dev.env npm run dev

# Staging (INFO level logs)
echo "Starting in STAGING mode..."
npx env-cmd -f ./config/staging.env npm start

# Production (WARN level logs only)
echo "Starting in PRODUCTION mode..."
npx env-cmd -f ./config/prod.env npm start
