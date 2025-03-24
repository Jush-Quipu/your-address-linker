
from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="secureaddress-bridge",
    version="1.0.0",
    author="SecureAddress Bridge Team",
    author_email="developers@secureaddress.bridge",
    description="Python SDK for SecureAddress Bridge to securely link blockchain wallets to verified physical addresses",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/secureaddress/bridge-sdk",
    project_urls={
        "Bug Tracker": "https://github.com/secureaddress/bridge-sdk/issues",
        "Documentation": "https://docs.secureaddress.bridge/sdk/python",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Intended Audience :: Developers",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    packages=find_packages(),
    install_requires=[
        "requests>=2.25.0",
    ],
    extras_require={
        "async": ["aiohttp>=3.7.0"],
    },
    python_requires=">=3.7",
)
