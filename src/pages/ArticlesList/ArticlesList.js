/* eslint-disable react/no-array-index-key */
/* eslint-disable no-unneeded-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-fragments */
/* eslint-disable arrow-body-style */
/* eslint-disable react/jsx-key */
/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */

import React, { useState, useEffect } from 'react';

import { Pagination } from 'antd';

import 'antd/dist/antd.css';

import styles from './ArticlesList.module.scss';

import ArticlPreview from '../../components/ArticlPreview';
import ErrorMessage from '../../components/ErrorMessage';
import Loader from '../../components/Loader';

import apiService from '../../services/ApiService';

const ArticlesList = function () {
  const [list, setList] = useState([]); // список статей
  const [isLoading, setLoading] = useState(true); // отображение лоадера
  const [isError, setIsError] = useState(false); // отобажение ошибки
  const [maxPagesNum, setMaxPagesNum] = useState(0); // считает максимальное число страниц
  const [page, setPage] = useState(1); // текущая страница

  const token = JSON.parse(localStorage.getItem('token')) ? JSON.parse(localStorage.getItem('token')) : '';

  useEffect(() => {
    getMaxPages(); // получает максимальное кол-во статей для рассчета пагинации
    getList(); // получаетс список статей для рендера
  }, []);

  // вычисляет сколько максимум отобразить страниц
  const getMaxPages = () => {
    apiService
      .getArticlesMax(token)
      .then((res) => {
        // console.log(res)
        setMaxPagesNum(Math.ceil(res.articlesCount / 5));
        setIsError(false);
      })
      .catch((err) => {
        showError();
      });
  };

  // получает список
  const getList = () => {
    apiService
      .getArticles(token)
      .then((res) => {
        // console.log(res)
        setList(res.articles);
        setLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        showError();
      });
  };

  // запрашивает новый список статей по изменению страницы пагинации
  const onChangePage = (value) => {
    setPage(value);
    setList({});
    setLoading(true);
    setIsError(false);

    apiService
      .getArticlesByPageNum((value - 1) * 5, token) // сдвигает кол-во страниц на 5
      .then((res) => {
        // console.log(res);
        setList(res.articles);
        setLoading(false);
        setIsError(false);
      })
      .catch((err) => {
        showError();
      });
  };

  const showError = () => {
    setIsError(true);
    setList({});
    setLoading(false);
  };

  // отображает список статей если он не пустой
  const newList =
    list.length && !isError ? (
      <ul className={styles['articles-list']}>
        {list.map((el, i) => {
          return (
            <li key={el.slug}>
              <ArticlPreview item={el} controllerFlag={false} />
            </li>
          );
        })}
      </ul>
    ) : null;

  // ошибка
  const errorMasege = isError ? (
    <ErrorMessage description="Data loading error. Please try reloading the page or try again later." type="error" />
  ) : null;

  // отображает пагинацию если список статей не пустой
  const pagination =
    list.length && !isError ? (
      <Pagination
        className={styles['ant-pagination']}
        showQuickJumper
        showSizeChanger={false}
        defaultCurrent={page}
        total={maxPagesNum * 10}
        onChange={onChangePage}
      />
    ) : null;

  // отображает индикатор заглушки
  const loading = isLoading ? <Loader /> : null;

  return (
    <React.Fragment>
      {newList}
      {pagination}
      {loading}
      {errorMasege}
    </React.Fragment>
  );
};

export default ArticlesList;
