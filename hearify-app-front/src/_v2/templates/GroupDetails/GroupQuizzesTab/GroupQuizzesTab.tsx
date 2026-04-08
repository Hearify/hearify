import React from 'react';

import QuizCard from '@v2/containers/QuizCard/QuizCard';
import styles from './GroupQuizzesTab.module.scss';

import { Quiz } from '@v2/types/quiz';

type GroupQuizzesTabProps = {
  quizzes: Quiz[];
  groupId: string;
};

const GroupQuizzesTab: React.FC<GroupQuizzesTabProps> = ({ groupId, quizzes }) => {
  return (
    <ul className={styles.list}>
      {quizzes.map((item) => (
        <QuizCard group groupId={groupId} quiz={item} onDelete={() => {}} />
      ))}
    </ul>
  );
};

export default GroupQuizzesTab;
