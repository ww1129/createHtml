var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');


gulp.task('scss',function(){
	return gulp.src('./scss/**/*.scss')
	.pipe(sass({
		outputStyle: 'compact'
		}))
	.pipe(postcss([autoprefixer(['iOS >= 8', 'last 2 versions', 'Android >= 4', 'ie >= 9'])]))
	.pipe(gulp.dest('/css'))
});

gulp.task('sass:watch', function () {
  gulp.watch('./scss/**/*.scss', ['scss']);
});

gulp.task('js',function(){
	return gulp.src('./js/**/*.js')
	.pipe(uglify({
        mangle: true,//类型：Boolean 默认：true 是否修改变量名
        compress: true,//类型：Boolean 默认：true 是否完全压缩
	}))
	.on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
	.pipe(gulp.dest('dist/js'))
})

gulp.task('default',['scss','sass:watch','js'])