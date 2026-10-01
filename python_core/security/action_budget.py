from typing import Dict, Any, Tuple

class ActionBudgetManager:
    """
    Tracks and enforces action budgets to prevent runaway scanning, loops, or denial of service.
    """
    
    def __init__(self, max_actions: int = 10, actions_used: int = 0):
        self.max_actions = max(1, int(max_actions))
        self.actions_used = max(0, int(actions_used))

    @property
    def remaining(self) -> int:
        return max(0, self.max_actions - self.actions_used)

    def can_execute(self, cost: int = 1) -> Tuple[bool, str]:
        if cost <= 0:
            return True, "No action budget required."
        if self.actions_used + cost > self.max_actions:
            return (
                False,
                f"Action limit exceeded ({self.actions_used}/{self.max_actions} used). Action cost: {cost}. Increase max actions limit in Settings or reset action counter."
            )
        return True, f"Budget available: {self.remaining} actions remaining."

    def deduct(self, cost: int = 1) -> int:
        self.actions_used += max(0, cost)
        return self.actions_used

    def reset(self, new_max: int = None) -> None:
        self.actions_used = 0
        if new_max is not None:
            self.max_actions = max(1, int(new_max))

    def to_dict(self) -> Dict[str, Any]:
        return {
            "max_actions": self.max_actions,
            "actions_used": self.actions_used,
            "remaining": self.remaining,
            "is_exhausted": self.actions_used >= self.max_actions,
        }
