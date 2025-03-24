
# SecureAddress Bridge Python SDK
#
# This SDK provides a Python implementation of the SecureAddress Bridge SDK
# for securely accessing verified physical addresses with enhanced blockchain support
# and blind shipping capabilities.
# Version: 1.0.0

import json
import time
import requests
import hmac
import hashlib
import base64
from typing import Dict, List, Optional, Union, Any


class SecureAddressBridge:
    """
    Python client for the SecureAddress Bridge API
    """
    
    def __init__(
        self,
        app_id: str,
        app_secret: str,
        base_url: str = "https://api.secureaddress.bridge",
        api_version: str = "v1",
        supported_chains: List[str] = None,
        supported_carriers: List[str] = None
    ):
        """
        Initialize the SecureAddress Bridge client
        
        Args:
            app_id: Your application ID
            app_secret: Your application secret
            base_url: The base URL of the SecureAddress Bridge API
            api_version: The API version to use
            supported_chains: List of supported blockchain networks
            supported_carriers: List of supported shipping carriers
        """
        self.app_id = app_id
        self.app_secret = app_secret
        self.base_url = base_url
        self.api_version = api_version
        self.access_token = None
        self.supported_chains = supported_chains or ["ethereum"]
        self.supported_carriers = supported_carriers or ["usps", "fedex", "ups"]
        self.supported_shipping_methods = {
            "usps": ["Priority", "First-Class", "Ground", "Express"],
            "fedex": ["Ground", "2Day", "Express", "Overnight"],
            "ups": ["Ground", "Next Day Air", "2nd Day Air", "3 Day Select"]
        }
    
    def set_access_token(self, token: str) -> None:
        """
        Set the access token for API calls
        
        Args:
            token: The access token
        """
        self.access_token = token
    
    def authenticate(self) -> Dict[str, Any]:
        """
        Authenticate with the API using app credentials
        
        Returns:
            Dict containing auth result with access token
        """
        auth_endpoint = f"{self.base_url}/{self.api_version}/auth"
        payload = {
            "app_id": self.app_id,
            "app_secret": self.app_secret
        }
        
        response = requests.post(auth_endpoint, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to authenticate"))
        
        data = response.json()
        self.access_token = data.get("access_token")
        
        return data
    
    def get_authorization_url(self, options: Dict[str, Any]) -> str:
        """
        Generate an authorization URL for users to grant permission
        
        Args:
            options: Dict containing authorization options
                - redirect_uri: The URI to redirect to after authorization
                - scope: List of address fields to request
                - expiry_days: Number of days until the permission expires
                - max_accesses: Maximum number of times the address can be accessed
                - preferred_chain: Preferred blockchain to use for authorization
                - state: Optional state parameter for CSRF protection
        
        Returns:
            The authorization URL
        """
        if "redirect_uri" not in options:
            raise ValueError("redirect_uri is required")
        
        if "scope" not in options:
            raise ValueError("scope is required")
        
        scope = options["scope"]
        if isinstance(scope, list):
            scope = " ".join(scope)
        
        params = {
            "app_id": self.app_id,
            "redirect_uri": options["redirect_uri"],
            "scope": scope,
            "expiry_days": options.get("expiry_days", 30),
            "version": self.api_version
        }
        
        if "max_accesses" in options:
            params["max_accesses"] = options["max_accesses"]
        
        if "preferred_chain" in options and options["preferred_chain"] in self.supported_chains:
            params["preferred_chain"] = options["preferred_chain"]
        
        if "state" in options:
            params["state"] = options["state"]
        
        # Build the query string
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        
        return f"{self.base_url}/authorize?{query_string}"
    
    def exchange_code(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Exchange an authorization code for an access token
        
        Args:
            options: Dict containing exchange options
                - code: The authorization code
                - redirect_uri: The redirect URI used in the authorization request
        
        Returns:
            Dict containing the exchange result with access token
        """
        if "code" not in options:
            raise ValueError("code is required")
        
        if "redirect_uri" not in options:
            raise ValueError("redirect_uri is required")
        
        exchange_endpoint = f"{self.base_url}/{self.api_version}/token"
        payload = {
            "app_id": self.app_id,
            "app_secret": self.app_secret,
            "code": options["code"],
            "redirect_uri": options["redirect_uri"],
            "grant_type": "authorization_code"
        }
        
        response = requests.post(exchange_endpoint, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to exchange code"))
        
        data = response.json()
        self.access_token = data.get("access_token")
        
        return data
    
    def get_address(self, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Get the user's address information
        
        Args:
            options: Dict containing request options
                - fields: List of specific fields to request
                - include_verification_info: Include verification details
                - access_token: Override the instance access token
        
        Returns:
            Dict containing the user's address information
        """
        options = options or {}
        
        access_token = options.get("access_token") or self.access_token
        if not access_token:
            raise Exception("No access token. Call authenticate or exchange_code first, or provide an access token.")
        
        url = f"{self.base_url}/{self.api_version}/address"
        query_params = []
        
        if "fields" in options and isinstance(options["fields"], list):
            query_params.append(f"fields={','.join(options['fields'])}")
        
        if options.get("include_verification_info"):
            query_params.append("include_verification=true")
        
        if query_params:
            url += f"?{'&'.join(query_params)}"
        
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
            "X-App-ID": self.app_id,
            "X-SDK-Version": "1.0.0"
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to get address"))
        
        return response.json()
    
    def validate_token(self, token: str = None) -> Dict[str, Any]:
        """
        Check if the access token is still valid
        
        Args:
            token: The access token to validate (defaults to instance token)
        
        Returns:
            Dict containing validation result
        """
        token = token or self.access_token
        if not token:
            return {"valid": False, "error": "No access token provided"}
        
        try:
            url = f"{self.base_url}/{self.api_version}/validate-token"
            headers = {
                "Authorization": f"Bearer {token}",
                "X-App-ID": self.app_id
            }
            
            response = requests.get(url, headers=headers)
            
            if response.status_code != 200:
                error_data = response.json()
                return {
                    "valid": False,
                    "error": error_data.get("error", "Token validation failed"),
                    "status": response.status_code
                }
            
            data = response.json()
            return {
                "valid": True,
                **data
            }
        
        except Exception as e:
            return {
                "valid": False,
                "error": str(e)
            }
    
    def register_webhook(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Register a webhook to receive notifications about address changes
        
        Args:
            options: Dict containing webhook options
                - url: The URL to send webhook events to
                - events: List of events to subscribe to
                - secret: Secret for signing webhook payloads
        
        Returns:
            Dict containing webhook registration result
        """
        if not self.access_token:
            raise Exception("No access token. Authentication required to register webhooks.")
        
        if "url" not in options:
            raise ValueError("Webhook URL is required")
        
        if "events" not in options or not isinstance(options["events"], list) or not options["events"]:
            raise ValueError("At least one event type must be specified")
        
        url = f"{self.base_url}/{self.api_version}/webhooks"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-App-ID": self.app_id
        }
        
        payload = {
            "url": options["url"],
            "events": options["events"]
        }
        
        if "secret" in options:
            payload["secret"] = options["secret"]
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to register webhook"))
        
        return response.json()
    
    def verify_webhook_signature(self, signature: str, payload: str, secret: str) -> bool:
        """
        Verify a webhook signature
        
        Args:
            signature: The signature from the X-Signature header
            payload: The raw webhook payload
            secret: Your webhook secret
        
        Returns:
            Whether the signature is valid
        """
        try:
            # Create an HMAC with the secret and message
            expected_sig = hmac.new(
                secret.encode('utf-8'),
                payload.encode('utf-8'),
                hashlib.sha256
            ).digest()
            
            # Encode the HMAC in base64 for comparison
            expected_sig_b64 = base64.b64encode(expected_sig).decode('utf-8')
            
            # Compare signatures using a constant time comparison (to prevent timing attacks)
            return hmac.compare_digest(signature, expected_sig_b64)
        
        except Exception as e:
            print(f"Error verifying webhook signature: {e}")
            return False
    
    def link_address_to_wallet(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Link a verified address to a blockchain wallet
        
        Args:
            options: Dict containing linking options
                - wallet_address: The blockchain wallet address
                - chain_id: The chain ID of the blockchain
                - create_verifiable_credential: Create a verifiable credential
        
        Returns:
            Dict containing the result of the linking operation
        """
        if not self.access_token:
            raise Exception("No access token. Authentication required to link address to wallet.")
        
        if "wallet_address" not in options:
            raise ValueError("Wallet address is required")
        
        if "chain_id" not in options:
            raise ValueError("Chain ID is required")
        
        url = f"{self.base_url}/{self.api_version}/link-wallet"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-App-ID": self.app_id
        }
        
        payload = {
            "wallet_address": options["wallet_address"],
            "chain_id": options["chain_id"],
            "create_vc": options.get("create_verifiable_credential", False)
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to link address to wallet"))
        
        return response.json()
    
    def get_usage_stats(self) -> Dict[str, Any]:
        """
        Get and refresh permission usage statistics
        
        Returns:
            Dict containing usage statistics
        """
        if not self.access_token:
            raise Exception("No access token. Authentication required.")
        
        url = f"{self.base_url}/{self.api_version}/usage-stats"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "X-App-ID": self.app_id
        }
        
        response = requests.get(url, headers=headers)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to get usage statistics"))
        
        return response.json()
    
    def create_blind_shipping_token(self, options: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Create a blind shipping token for secure shipping without exposing address
        
        Args:
            options: Dict containing blind shipping options
                - carriers: List of allowed carriers (e.g., ['usps', 'fedex', 'ups'])
                - shipping_methods: List of allowed shipping methods
                - require_confirmation: Whether to require delivery confirmation
                - expiry_days: Number of days until the shipping token expires
                - max_uses: Maximum number of times the shipping token can be used
        
        Returns:
            Dict containing the result with the shipping token
        """
        options = options or {}
        
        if not self.access_token:
            raise Exception("No access token. Call authenticate or exchange_code first.")
        
        if "carriers" not in options or not isinstance(options["carriers"], list) or not options["carriers"]:
            raise ValueError("At least one carrier must be specified")
        
        if "shipping_methods" not in options or not isinstance(options["shipping_methods"], list) or not options["shipping_methods"]:
            raise ValueError("At least one shipping method must be specified")
        
        invalid_carriers = [c for c in options["carriers"] if c not in self.supported_carriers]
        if invalid_carriers:
            raise ValueError(f"Unsupported carriers: {', '.join(invalid_carriers)}")
        
        invalid_methods = []
        for carrier in options["carriers"]:
            supported_methods = self.supported_shipping_methods.get(carrier, [])
            for method in options["shipping_methods"]:
                if method not in supported_methods:
                    invalid_methods.append(f"{method} for {carrier}")
        
        if invalid_methods:
            raise ValueError(f"Unsupported shipping methods: {', '.join(invalid_methods)}")
        
        url = f"{self.base_url}/{self.api_version}/create-shipping-token"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-App-ID": self.app_id
        }
        
        payload = {
            "carriers": options["carriers"],
            "shipping_methods": options["shipping_methods"],
            "require_confirmation": options.get("require_confirmation", False),
            "expiry_days": options.get("expiry_days", 7),
            "max_uses": options.get("max_uses", 1)
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to create blind shipping token"))
        
        return response.json()
    
    def request_shipment(self, options: Dict[str, Any]) -> Dict[str, Any]:
        """
        Request a shipment using a blind shipping token
        
        Args:
            options: Dict containing shipment request options
                - shipping_token: The blind shipping token
                - carrier: The carrier to use (e.g., 'usps', 'fedex', 'ups')
                - service: The shipping service to use
                - package: Dict containing package details
        
        Returns:
            Dict containing the result with tracking information
        """
        if "shipping_token" not in options:
            raise ValueError("Shipping token is required")
        
        if "carrier" not in options or options["carrier"] not in self.supported_carriers:
            raise ValueError(f"Invalid or unsupported carrier: {options.get('carrier')}")
        
        carrier_methods = self.supported_shipping_methods.get(options["carrier"], [])
        if "service" not in options or options["service"] not in carrier_methods:
            raise ValueError(f"Invalid or unsupported shipping service: {options.get('service')}")
        
        if "package" not in options or "type" not in options["package"]:
            raise ValueError("Package type is required")
        
        url = f"{self.base_url}/{self.api_version}/request-shipment"
        headers = {
            "Content-Type": "application/json",
            "X-App-ID": self.app_id
        }
        
        payload = {
            "shipping_token": options["shipping_token"],
            "carrier": options["carrier"],
            "service": options["service"],
            "package": options["package"]
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to request shipment"))
        
        return response.json()
    
    def get_tracking_info(self, tracking_number: str, carrier: str) -> Dict[str, Any]:
        """
        Get tracking information for a shipment
        
        Args:
            tracking_number: The tracking number
            carrier: The carrier (e.g., 'usps', 'fedex', 'ups')
        
        Returns:
            Dict containing tracking information
        """
        if not tracking_number:
            raise ValueError("Tracking number is required")
        
        if not carrier or carrier not in self.supported_carriers:
            raise ValueError(f"Invalid or unsupported carrier: {carrier}")
        
        url = f"{self.base_url}/{self.api_version}/tracking"
        params = {
            "number": tracking_number,
            "carrier": carrier
        }
        
        headers = {
            "Content-Type": "application/json",
            "X-App-ID": self.app_id
        }
        
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to get tracking information"))
        
        return response.json()
    
    def confirm_delivery(self, tracking_number: str, carrier: str) -> Dict[str, Any]:
        """
        Confirm delivery for a shipment (if confirmation is required)
        
        Args:
            tracking_number: The tracking number
            carrier: The carrier (e.g., 'usps', 'fedex', 'ups')
        
        Returns:
            Dict containing confirmation result
        """
        if not self.access_token:
            raise Exception("No access token. Call authenticate or exchange_code first.")
        
        if not tracking_number:
            raise ValueError("Tracking number is required")
        
        if not carrier or carrier not in self.supported_carriers:
            raise ValueError(f"Invalid or unsupported carrier: {carrier}")
        
        url = f"{self.base_url}/{self.api_version}/confirm-delivery"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-App-ID": self.app_id
        }
        
        payload = {
            "tracking_number": tracking_number,
            "carrier": carrier
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code != 200:
            error_data = response.json()
            raise Exception(error_data.get("error", "Failed to confirm delivery"))
        
        return response.json()


class AsyncSecureAddressBridge(SecureAddressBridge):
    """
    Async version of the SecureAddressBridge client (requires aiohttp)
    
    Note: This is a placeholder class. Actual implementation would use aiohttp
    for async HTTP requests. This would need to be implemented by users who
    need async functionality.
    """
    pass
