import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import GroupImg from '@/assets/images/blog-group.png';
import AppBreadcrumbs from '@/components/AppBreadcrumbs/AppBreadcrumbs';
import AuthorCard from '@/containers/AuthorCard/AuthorCard';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import ArticleCard from '@/containers/ArticleCard/ArticleCard';
import AppHeading from '@/components/AppHeading/AppHeading';
import FAQBlock from '@/containers/FAQBlock/FAQBlock';
import ArticleSchema from '@/templates/Article/ArticleSchema/ArticleSchema';
import slugify from '@/utils/slugify';
import styles from './Article.module.scss';
import FAQSchema from '@/containers/FAQSchema/FAQSchema';

import type { Article as ArticleType } from '@/types/article';

export type ArticleProps = {
  article: ArticleType;
  headers: string[];
  children: React.ReactNode;
};

const Article: React.FC<ArticleProps> = ({
  article, //
  headers,
  children,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  const cleanPath: string = router.asPath.split('#')[0].split('?')[0];

  return (
    <div className={styles.wrapper}>
      <ArticleSchema article={article} />

      <div className={styles.main}>
        <article className={styles.body}>
          <AppBreadcrumbs
            items={[
              { text: t('blog'), href: '/blog' },
              { text: article.headline, href: `/blog/${article.slug}` },
            ]}
          />

          <div className={styles.authors}>
            {/* eslint-disable jsx-a11y/aria-role */}
            <AuthorCard author={article.author} role="author" />
            <AuthorCard author={article.editor} role="editor" />
          </div>

          <div className={styles.header}>
            <h1 className={styles.title}>{article.headline}</h1>

            <div className={styles.container}>
              <span className={styles.text}>{article.minutesToRead} min read</span>
              <span className={styles.text}>·</span>
              <span className={styles.text}>{article.date}</span>
            </div>
          </div>

          <div className={styles.content}>{children}</div>

          <div className={styles.footer}>
            <div className={styles.about}>
              <div className={styles.aboutContainer}>
                <Image
                  src={article.author.avatarUrl}
                  alt={article.author.name}
                  className={styles.aboutImage}
                  width={100}
                  height={100}
                />
                <h4 className={styles.aboutTitle}>
                  {t('written_by')} {article.author.name}
                </h4>
              </div>
              <p className={styles.aboutText}>{article.author.aboutMe}</p>
            </div>
          </div>
        </article>

        <aside className={styles.sidebar}>
          <h3 className={styles.sidebarTitle}>{t('table_of_contents')}</h3>
          <nav className={styles.sidebarContainer}>
            {headers.map(item => (
              <Link key={item} className={styles.sidebarItem} href={`${cleanPath}#${slugify(item)}`}>
                {item}
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      {article.faq && (
        <div className={styles.faq}>
          <FAQSchema items={article.faq} />

          <AppHeading variant="h2" className={styles.faqTitle}>
            {t('faq')}
          </AppHeading>

          <div className={styles.faqList}>
            {article.faq.map(faq => (
              <FAQBlock key={faq.question} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      )}

      <BoostAlert
        title={t('boost_your_knowledge')}
        text={t('try_out_ai_quiz')}
        button={t('try_for_free')}
        image={GroupImg}
        width={360}
        height={300}
      />

      <div className={styles.suggestions}>
        <AppHeading variant="h2">{t('related_posts')}</AppHeading>

        <div className={styles.suggestionsList}>
          {article.suggestions.map(suggestion => (
            <ArticleCard key={suggestion.slug} article={suggestion} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Article;
