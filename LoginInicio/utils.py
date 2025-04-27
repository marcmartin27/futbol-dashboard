import datetime
from calendar import timegm
from rest_framework_jwt.settings import api_settings

def jwt_payload_handler(user):
    """Custom JWT payload handler for MongoDB user model"""
    payload = {
        'user_id': str(user.id),
        'username': user.username,
        'email': user.email,
        'exp': datetime.datetime.utcnow() + api_settings.JWT_EXPIRATION_DELTA
    }
    
    # Include original issued at time for a brand new token
    if api_settings.JWT_ALLOW_REFRESH:
        payload['orig_iat'] = timegm(
            datetime.datetime.utcnow().utctimetuple()
        )
    
    return payload