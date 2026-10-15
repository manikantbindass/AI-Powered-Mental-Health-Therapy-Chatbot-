from rest_framework import permissions

class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, "user"):
            return obj.user == request.user
        if hasattr(obj, "session") and hasattr(obj.session, "user"):
            return obj.session.user == request.user
        return False
