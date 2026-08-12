# 시가 직구 세금 계산기

정적 HTML로 동작하는 한국 시가 해외직구 예상 세금 계산기입니다.

## 환율 구분

- 구매 결제금액: 네이버 환율
- 150 USD 판정과 관세·부가세: 관세청 주간 수입 과세환율
- 담배소비세·지방교육세·개별소비세: 시가 무게 기준 원화 정액

## 무료 주간환율 갱신

`customs-rates.json`은 매주 일요일 01:15(KST)에 GitHub Actions로 갱신됩니다.

1. [관세청 관세환율정보 API](https://www.data.go.kr/data/15101230/openapi.do) 활용신청
2. GitHub 저장소 `Settings > Secrets and variables > Actions`에서
   `DATA_GO_KR_SERVICE_KEY` 등록
3. Netlify 사이트를 해당 GitHub 저장소에 연결

정상 갱신되면 Actions가 `customs-rates.json`을 커밋하고 Netlify가 새 정적 파일을 배포합니다. 갱신에 실패하면 마지막 정상 환율을 사용하면서 화면에 `과세환율 갱신 지연`을 표시합니다.

## Netlify 배포

저장소를 Netlify에 연결하면 `netlify.toml` 설정이 자동으로 적용됩니다. 별도의 빌드 설정은 입력하지 않아도 됩니다.

- 배포 디렉터리: `dist`
- 실제 공개 파일: `index.html`, `tax-policy.js`, `customs-rates.json`
- 배포 제외: 백업, UI 시안, 테스트, 환율 갱신 스크립트

백업과 시안 파일은 저장소에는 보존되지만 웹사이트 URL로는 공개되지 않습니다.

## 확인

```bash
node tests/tax-policy.test.cjs
node tests/customs-rates.test.cjs
```
