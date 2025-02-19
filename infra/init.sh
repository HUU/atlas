#!/bin/bash
# https://google.github.io/styleguide/shellguide.html

set -e
set -o nounset

SCRIPT_PATH="$( cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null; pwd -P )"
declare -r SCRIPT_PATH

function _check_required_programs() {
    for p in "${@}"; do
      hash "${p}" 2>&- || \
          { echo >&2 " Required program \"${p}\" not installed or in search PATH.";
            exit 1; }
    done
}

function usage() {
  cat <<EOF
Usage: $0 -b [state bucket name]

Simple script to bootstrap a Pulumi state bucket if it does not already exist and verify
that all prerequisites are in place for local operation of the pulumi CLI.
EOF
}

function main() {

  local bucket_name='atlas-pulumi-state-bucket'
  local location='us-central1'
  while builtin getopts "blh" opt; do
      case $opt in
        b) bucket_name="${OPTARG}" ;;
        l) location="${OPTARG}" ;;
        h) usage; exit 0
          ;;
        \?)
        usage
        exit 1
          ;;
        :)
          echo "required argument not found for option -${OPTARG}" >&2
          usage
          exit 1
          ;;
      esac
  done


  # check if the user is logged in
  if gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "You are logged in as $(gcloud auth list --filter=status:ACTIVE --format="value(account)")"
  else
    echo "You are not logged in. Please run 'gcloud auth login'."
    exit 1
  fi


  # check if user is logged in with application-default credentials
  if ! gcloud auth application-default print-access-token &> /dev/null; then
      echo "No valid application-default credentials found. Please run 'gcloud auth application-default login'."
      exit 1
  fi


  # enable base layer of services for Pulumi to function
  if gcloud services list --filter "name:compute.googleapis.com" 2>/dev/null | grep -q .; then
    echo "compute.googleapis.com already enabled"
  else
    gcloud services enable compute.googleapis.com
  fi

  if gcloud services list --filter "name:cloudkms.googleapis.com" 2>/dev/null | grep -q .; then
    echo "cloudkms.googleapis.com already enabled"
  else
    gcloud services enable cloudkms.googleapis.com
  fi


  # check if the bucket already exists
  if gsutil ls -b "gs://${bucket_name}" &> /dev/null; then
      echo "Bucket ${bucket_name} already exists."
  else
      # create the bucket
      if gsutil mb "gs://${bucket_name}"; then
          echo "Bucket ${bucket_name} created successfully."
      else
          echo "Failed to create bucket ${bucket_name}."
          exit 1
      fi
  fi

  # check if the secret keyring + key already exists
  local keyring_name="atlas"
  if gcloud kms keyrings list --location="${location}" --filter="name:${keyring_name}" --format="value(name)" 2>/dev/null | grep -q .; then
    echo "Keyring ${keyring_name} already exists."
  else
    gcloud kms keyrings create "${keyring_name}" --location "${location}"
  fi

  local key_name="pulumi-secrets"
  if gcloud kms keys list --location="${location}" --keyring="${keyring_name}" --filter="name:${key_name}" --format="value(name)" 2>/dev/null | grep -q .; then
    echo "Key ${key_name} exists in keyring ${keyring_name}."
  else
    gcloud kms keys create "${key_name}" --location="${location}" --keyring="${keyring_name}" --purpose "encryption"
  fi

  
  # configure pulumi
  pulumi login "gs://${bucket_name}"
  pulumi stack init staging --secrets-provider="gcpkms://$(gcloud kms keys list --location="${location}" --keyring="${keyring_name}" --filter="name:${key_name}" --format="value(name)")"
  # pulumi stack init production -- not supported yet in case I want to make a ton of changes no need to make them twice


  echo "Setup completed successfully."
  exit 0
}

_check_required_programs gcloud gsutil pulumi
main "$@"
