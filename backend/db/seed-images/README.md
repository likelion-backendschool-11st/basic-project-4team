# 시드 이미지

`npm run db:seed` 때 이 폴더의 파일을 `uploads/seed/`로 복사한다. `db/seed.sql`은 `/uploads/seed/...` 경로로 참조한다.
(`uploads/`는 git에 올라가지 않으므로 원본은 여기에 둔다.)

## 출처 (Wikimedia Commons, 960px로 축소)

| 파일 | 품목 | 원본 | 작성자 | 라이선스 |
|---|---|---|---|---|
| `sneakers/jordan-1-chicago.jpg` | 조던 1 레트로 하이 OG 시카고 | [Game Worn Air Jordan 1s.jpg](https://commons.wikimedia.org/wiki/File:Game_Worn_Air_Jordan_1s.jpg) | Jordan Geller | CC BY-SA 4.0 |
| `sneakers/jordan-4-military-black.jpg` | 조던 4 레트로 밀리터리 블랙 | [Nike Air Jordan IV.jpg](https://commons.wikimedia.org/wiki/File:Nike_Air_Jordan_IV.jpg) | Osyffar | CC0 |
| `sneakers/dunk-low-panda.jpg` | 나이키 덩크 로우 레트로 블랙 화이트 | [Panda Nike Dunk.jpg](https://commons.wikimedia.org/wiki/File:Panda_Nike_Dunk.jpg) | LeDroider | CC0 |
| `sneakers/dunk-low-grey-fog.jpg` | 나이키 덩크 로우 그레이 포그 | [Nike Dunk Low.jpg](https://commons.wikimedia.org/wiki/File:Nike_Dunk_Low.jpg) | Quimacian | CC BY-SA 4.0 |

트래비스 스캇 x 조던 1 로우 모카, 사카이 x 나이키 LD와플은 자유 라이선스 사진을 찾지 못해 비워 두었다
(이 두 품목의 판매글은 실물 인증 사진도 없다).

## 실물 인증 사진 (`sneakers/auth/listing-{판매글 id}.jpg`)

위 사진 또는 아래 사진에 "RE:PICK · @판매자 닉네임 · 실물 인증" 메모 카드를 합성해 만들었다 (원본과 같은 라이선스).
시드 날짜는 실행 시점 기준 상대값이라 메모에 날짜는 넣지 않았다.

| 파일 | 바탕 사진 | 작성자 | 라이선스 |
|---|---|---|---|
| `listing-130` | Game Worn Air Jordan 1s.jpg (위) | Jordan Geller | CC BY-SA 4.0 |
| `listing-141`, `listing-143` | [Air Jordan 4 (Cement).jpg](https://commons.wikimedia.org/wiki/File:Air_Jordan_4_(Cement).jpg) | NYR-NYG-NYY | CC BY-SA 3.0 |
| `listing-176` | [Nike dunk (pandas).jpg](https://commons.wikimedia.org/wiki/File:Nike_dunk_(pandas).jpg) | Premeditated | CC BY-SA 4.0 |
| `listing-184`, `listing-186` | Nike Dunk Low.jpg (위) | Quimacian | CC BY-SA 4.0 |
