import * as $ from 'jquery';
import './styles/index'
import './analytics'
import Post from './components/Post/Post';

const post = new Post('Webpack post title')

$('pre').html(post.toString())