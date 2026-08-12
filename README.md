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

## 확인

```bash
node tests/tax-policy.test.cjs
node tests/customs-rates.test.cjs
```
