from django.contrib.auth import login, logout
from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminRole, IsAuthenticatedStaff
from .serializers import (
	LoginSerializer,
	PasswordChangeSerializer,
	UserCreateSerializer,
	UserSerializer,
)

User = get_user_model()


class UserViewSet(viewsets.ModelViewSet):
	queryset = User.objects.all()
	permission_classes = (IsAuthenticatedStaff,)

	def get_serializer_class(self):
		if self.action == "create":
			return UserCreateSerializer
		return UserSerializer

	def get_permissions(self):
		if self.action in ("create", "update", "partial_update", "destroy"):
			return [IsAdminRole()]
		return super().get_permissions()

	def get_queryset(self):
		queryset = super().get_queryset()
		params = self.request.query_params
		role = params.get("role")
		if role:
			queryset = queryset.filter(role=role.upper())
		search = params.get("search")
		if search:
			queryset = queryset.filter(
				Q(username__icontains=search)
				| Q(email__icontains=search)
				| Q(first_name__icontains=search)
				| Q(last_name__icontains=search)
			)
		return queryset


class LoginView(APIView):
	permission_classes = (permissions.AllowAny,)

	def post(self, request):
		serializer = LoginSerializer(data=request.data, context={"request": request})
		serializer.is_valid(raise_exception=True)
		login(request, serializer.validated_data["user"])
		return Response(UserSerializer(serializer.validated_data["user"]).data)


class LogoutView(APIView):
	permission_classes = (IsAuthenticatedStaff,)

	def post(self, request):
		logout(request)
		return Response(status=status.HTTP_204_NO_CONTENT)


class CurrentUserView(APIView):
	permission_classes = (IsAuthenticatedStaff,)

	def get(self, request):
		return Response(UserSerializer(request.user).data)


class PasswordChangeView(APIView):
	permission_classes = (IsAuthenticatedStaff,)

	def post(self, request):
		serializer = PasswordChangeSerializer(
			data=request.data,
			context={"request": request},
		)
		serializer.is_valid(raise_exception=True)
		request.user.set_password(serializer.validated_data["new_password"])
		request.user.save(update_fields=("password",))
		login(request, request.user)
		return Response({"detail": "Password changed successfully."})
