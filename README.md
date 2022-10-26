README

поправь навание Realm на qr-code-scanner-pass
импортируй клиента angular
создай Client scope с Mapper type = Audience; В Included Client Audience добавь angular

Вроде бы все, но кажется что что-то забыл


POSTMAN 

https://109.120.191.44:8443/realms/qr-code-scanner-pass/protocol/openid-connect/token

BODY : x-www-form-urlencoded

username:test
password:test
client_id:angular
grant_type:password 	