import type { Metadata } from "next";
import BlogLayout from "./BlogLayout";

export const metadata: Metadata = {
  title: "세모계 블로그 | 생활·경제 정보를 쉽게",
  description: "경제와 생활에 필요한 정보를 공식 자료와 함께 알기 쉽게 전하는 세모계 블로그입니다.",
  alternates: { canonical: "https://semogye.com/blog" },
  openGraph: { title: "세모계 블로그", description: "생활과 경제 정보를 쉽게 읽는 세모계 블로그", url: "https://semogye.com/blog", siteName: "세모계", type: "website", locale: "ko_KR" },
};

export default function BlogRouteLayout({ children }: { children: React.ReactNode }) {
  return <BlogLayout>{children}</BlogLayout>;
}
