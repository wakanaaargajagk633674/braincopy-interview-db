export const SAFETY_NOTICE_ITEMS = [
  "実名、故人名、住所、電話番号などの個人情報は入力しないでください。",
  "法律、相続、宗教、医療については断定しないでください。",
  "このツールは熟練者の思考整理用であり、一般相談者への自動回答用ではありません。",
] as const;

export const SAFETY_NOTICE_TEXT = SAFETY_NOTICE_ITEMS.join("\n");
