#!/usr/bin/env python3
import argparse
import glob
import shlex
import sys

try:
    import tomllib
except ModuleNotFoundError:
    import tomli as tomllib


def load_config(path):
    with open(path, "rb") as f:
        return tomllib.load(f)


def parse_overrides(value):
    result = {}

    if isinstance(value, str):
        parts = shlex.split(value)
    elif isinstance(value, list):
        parts = value
    else:
        parts = []

    for part in parts:
        if "=" in part:
            key, val = part.split("=", 1)
            result[key] = val.strip('"')

    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default=None)
    parser.add_argument("--field", choices=["bucket", "region", "s3uri"], required=True)
    args = parser.parse_args()

    config_path = args.config
    if not config_path:
        matches = sorted(glob.glob("samconfig*.toml"))
        if not matches:
            sys.exit("No samconfig*.toml found")
        config_path = matches[0]

    data = load_config(config_path)

    deploy_params = data.get("default", {}).get("deploy", {}).get("parameters", {})
    global_params = data.get("default", {}).get("global", {}).get("parameters", {})

    region = deploy_params.get("region") or global_params.get("region")
    overrides = parse_overrides(deploy_params.get("parameter_overrides", ""))

    bucket = overrides.get("BucketName")

    if not bucket:
        sys.exit("BucketName not found in parameter_overrides")

    if args.field == "bucket":
        print(bucket)
    elif args.field == "region":
        print(region or "")
    elif args.field == "s3uri":
        print(f"s3://{bucket}")


if __name__ == "__main__":
    main()