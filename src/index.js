import * as $ from 'jquery';


// JS
import './js/index'
// SCSS
import './styles/index'

import Post from './components/post/post';

const post = new Post('Webpack post title')

$('pre').html(post.toString())
