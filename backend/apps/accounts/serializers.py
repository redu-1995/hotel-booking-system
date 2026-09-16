from django.contrib.auth import authenticate, get_user_model, password_validation
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "role",
            "is_active",
            "created_at",
        )
        read_only_fields = ("id", "created_at")


class UserCreateSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("password",)

    def validate_password(self, value):
        password_validation.validate_password(value, user=self.instance)
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.is_staff = True
        user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        if password:
            password_validation.validate_password(password, user=instance)
            instance.set_password(password)
        return super().update(instance, validated_data)


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        identifier = attrs["username"]
        user = authenticate(
            request=self.context.get("request"),
            username=identifier,
            password=attrs["password"],
        )
        if user is None and "@" in identifier:
            try:
                user = authenticate(
                    request=self.context.get("request"),
                    username=User.objects.get(email__iexact=identifier).username,
                    password=attrs["password"],
                )
            except User.DoesNotExist:
                user = None
        if user is None:
            raise serializers.ValidationError("Invalid username or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)

    def validate_old_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value, user=self.context["request"].user)
        return value