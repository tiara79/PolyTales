export default function stripHtml(str = "") {
  if (typeof str !== "string") return "";
  return str.replace(/<[^>]*>?/gm, "");
}
