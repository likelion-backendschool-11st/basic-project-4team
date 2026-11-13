## 멈춘 이유
외부 환경(DB 권한) 문제. 테스트 계정 `repick`에 테스트 DB `repick_schema_test`를 만들고 지울 권한이 없어, 스키마 검사가 실행되기 전에 실패한다. 구현(schema.sql) 문제가 아니다.

## 증거 (오류 줄 / 명령 출력)
```
Error: Access denied for user 'repick'@'%' to database 'repick_schema_test'
  at dropTestDb (tests/helpers/db.js:39:16)
  code: 'ER_DBACCESS_DENIED_ERROR', errno: 1044
  sql: 'DROP DATABASE IF EXISTS `repick_schema_test`'
```
schema_index.test.js, schema_constraints.test.js 모두 같은 지점(freshSchema → dropTestDb)에서 실패. VERIFY: FAIL (5/6 실패)

## 사람이 결정할 것 (선택지 2~3개)
1. (추천) MySQL root로 권한 부여 후 verify 재실행
   `GRANT ALL PRIVILEGES ON \`repick_schema_test\`.* TO 'repick'@'%';`
2. 테스트용으로 CREATE/DROP 권한이 있는 다른 계정을 .env에 지정
3. 이번 작업(push)에서는 verify를 보류하고 나중에 확인
