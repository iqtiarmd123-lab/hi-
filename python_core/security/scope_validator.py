import re
import ipaddress
from typing import Tuple, Dict, Any, List

class ScopeValidator:
    """
    Validates targets against security scope constraints:
    - LOCALHOST: 127.0.0.1, ::1, localhost, local domains
    - PRIVATE_NETWORK: 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, *.local, *.internal
    - AUTHORIZED_LAB: Docker containers, CTF platforms, DVWA, Juice Shop, *.lab
    - USER_AUTHORIZED_TARGET: Explicit user-specified target requiring verified authorization check
    """
    
    ALLOWED_SCOPES = [
        "LOCALHOST",
        "PRIVATE_NETWORK",
        "AUTHORIZED_LAB",
        "USER_AUTHORIZED_TARGET",
    ]
    
    @classmethod
    def is_loopback(cls, target: str) -> bool:
        clean = target.lower().strip()
        if clean in ["localhost", "127.0.0.1", "::1", "0.0.0.0"]:
            return True
        try:
            ip = ipaddress.ip_address(clean)
            return ip.is_loopback
        except ValueError:
            return False

    @classmethod
    def is_private_ip(cls, target: str) -> bool:
        clean = target.lower().strip()
        try:
            ip = ipaddress.ip_address(clean)
            return ip.is_private or ip.is_loopback
        except ValueError:
            # Check private hostname patterns
            if any(clean.endswith(ext) for ext in [".local", ".lan", ".internal", ".home", ".lab"]):
                return True
            return False

    @classmethod
    def validate_target(
        cls,
        target: str,
        scope: str,
        is_target_authorized: bool = False,
    ) -> Tuple[bool, str]:
        if not target or not target.strip():
            return False, "Target cannot be empty. Please specify a valid IP, hostname, or URL."
            
        clean_target = target.strip()
        
        # Remove http:// or https:// and port for host evaluation if present
        host_match = re.match(r'^(?:https?:\/\/)?([^:\/\s]+)', clean_target)
        host = host_match.group(1) if host_match else clean_target
        
        if scope == "LOCALHOST":
            if not cls.is_loopback(host):
                return (
                    False,
                    f"Target '{target}' is not localhost. Current scope is locked to LOCALHOST. Use 127.0.0.1 or localhost, or switch scope in Settings."
                )
            return True, "Target verified as LOCALHOST."
            
        elif scope == "PRIVATE_NETWORK":
            if not cls.is_private_ip(host):
                return (
                    False,
                    f"Target '{target}' is not recognized as a private RFC1918 address (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16) or .local/.internal domain."
                )
            return True, "Target verified as PRIVATE_NETWORK."
            
        elif scope == "AUTHORIZED_LAB":
            # Lab targets: localhost, docker bridge, .lab domains, or explicitly marked
            if cls.is_loopback(host) or cls.is_private_ip(host) or ".lab" in host or "docker" in host:
                return True, "Target verified as AUTHORIZED_LAB."
            if is_target_authorized:
                return True, "Target explicitly authorized under AUTHORIZED_LAB scope."
            return (
                False,
                f"Target '{target}' is not in local lab range and has not been explicitly authorized. Confirm authorization checkbox first."
            )
            
        elif scope == "USER_AUTHORIZED_TARGET":
            if not is_target_authorized:
                return (
                    False,
                    f"Target '{target}' requires explicit written authorization statement and confirmation checkbox before execution."
                )
            return True, "Target explicitly confirmed as USER_AUTHORIZED_TARGET."
            
        else:
            return False, f"Unknown security scope: '{scope}'. Must be one of {cls.ALLOWED_SCOPES}."
