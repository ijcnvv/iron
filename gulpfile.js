'use strict';

const gulp = require('gulp');

// компилит файлы в css
const less = require('gulp-less');

// рисует сорсмап стилей
const sourcemaps = require('gulp-sourcemaps');

// удаляет директорию
const del = require('del');

// устанавливает ветвление
const gulpIf = require('gulp-if');

// проверяет файл на идентичность в продакшне, если есть, не пропускает
const newer = require('gulp-newer');

// отображает в каких файлах происходят изменения
const debug = require('gulp-debug');

// автопрефиксы в стилях
const autoprefixer = require('gulp-autoprefixer');

// минифицирует файлы стилей
const cssnano = require('gulp-cssnano');

// уведомления об ошибках
const notify = require('gulp-notify');

// компрессор js файлов
const uglify = require('gulp-uglify');
const pump = require('pump');

const babel = require('gulp-babel');

const zip = require('gulp-zip');

// по умолчанию мы в разработке
let isDev = true;

// удаляем папку продакшна
gulp.task('clean', function() {
  return del('public');
})

// копируем файлы
gulp.task('assets', function() {

  return gulp.src('src/assets/**', {
      since: gulp.lastRun('assets')
    })
    .pipe(newer('public'))
    .pipe(debug({
      title: 'assets'
    }))
    .pipe(gulp.dest('public'))
});

// компилим стили и минифицируем
gulp.task('less', function() {

  return gulp.src('src/less/main.less')
    .pipe(gulpIf(isDev, sourcemaps.init()))
    .pipe(less())
    .on('error', notify.onError(function(err) {
      return {
        title: 'Less',
        message: err.message
      }
    }))
    .pipe(cssnano())
    .pipe(gulpIf(isDev, sourcemaps.write()))
    .pipe(gulp.dest('public/css'))
});

gulp.task('css', function() {

  return gulp.src('src/css/*.css')
    .on('error', notify.onError(function(err) {
      return {
        title: 'css',
        message: err.message
      }
    }))
    .pipe(cssnano())
    .pipe(gulp.dest('public/css'))
});


// копируем js
gulp.task('js', function(cb) {

  pump([
    gulp.src('src/js/**', {
      since: gulp.lastRun('js')
    }),
    // gulpIf(!isDev, babel({
    //   presets: ['@babel/env']
    // })),
    // gulpIf(!isDev, uglify()),
    newer('public'),
    gulp.dest('public/js')
  ], cb)

});

// сначала удаляем продакшн, затем параллельно копируем все
gulp.task('generate', gulp.series('clean', gulp.parallel('assets', 'css', 'less', 'js')));

//отслеживаем изменения в файлах
gulp.task('watch', function() {

  gulp.watch('src/css/**', gulp.series('css'));
  gulp.watch('src/less/**', gulp.series('less'));
  gulp.watch('src/js/**', gulp.series('js'));
  gulp.watch('src/assets/**', gulp.series('assets'));
});

// устанавливаем переменную в продашкн
gulp.task('setprod', (cb) => {
  isDev = false;
  cb();
});

gulp.task('setdev', (cb) => {
  isDev = true;
  cb();
});

gulp.task('zip', (cb) => {

  del('bot.zip');

  gulp.src('public/**')
    .pipe(zip('iron.zip'))
    .pipe(gulp.dest('./'));

  cb();
});

gulp.task('dev', gulp.series('setdev','generate', 'watch'));
gulp.task('build', gulp.series('setprod', 'generate', 'zip'));