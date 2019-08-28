<?php
/**
 * @package SpeakAbout
 * @version 1.0.0
 */
/*
Plugin Name: SpeakAbout
Plugin URI: https://speakabout.blog/
Description: Connect with your blog readers through an interactive highlighting tool.
Author: Ben Reimer
Version: 1.0.0
Author URI: https://www.benreimer.design
*/

//THE EXAMPLE
// add_action( 'the_content', 'my_thank_you_text' );

// function my_thank_you_text ( $content ) {
// 	$urll = admin_url("admin-ajax.php");
//     return $content .= $urll;
// }

//ENQUEUE MY JS
function speakabout_enqueue_script() { 
	wp_enqueue_script('rangycore', plugin_dir_url(__FILE__) . 'rangy-core.js');
	wp_enqueue_script('rangyclass', plugin_dir_url(__FILE__) . 'rangy-classapplier.js');
	wp_enqueue_script('rangyhighlighter', plugin_dir_url(__FILE__) . 'rangy-highlighter.js');
	wp_enqueue_script('index', plugin_dir_url(__FILE__) . 'index.js', array('jquery'));
	wp_enqueue_style('speakaboutstyle', plugin_dir_url(__FILE__) . 'speak-about-style.css');
	wp_localize_script( 'index', 'sa_ajax', array( 
	'ajaxurl' => admin_url( 'admin-ajax.php')
	));
	// wp_localize_script('index', 'sa_ajax', array(
   	// 'pluginsUrl' => plugins_url(),
	// ));
}
add_action('wp_enqueue_scripts', 'speakabout_enqueue_script');


// Email the report
// add_action( 'wp_ajax_my_action', 'email_report' );
// add_action( 'wp_ajax_nopriv_my_action', 'email_report' );
add_action( 'wp_ajax_siteWideMessage', 'wpse_sendmail' );
add_action( 'wp_ajax_nopriv_siteWideMessage', 'wpse_sendmail' );

function wpse_sendmail()
{
	$report = $_POST['report'];
	// $highlight = $_POST['highlight'];
	// $email = $_POST['email'];
    // $email = $_POST['email'];
    // $headers = 'From: '.$email ."\r\n".'Reply-To: '.$email;
    // $message = $_POST['message_message'];
    // $respond = $_POST['message_email'];

    /*if(wp_mail( "support@ontrgt.net", "(OTN) Support: ".$for, $message, $headers))
    {
        echo "WOOHOO";
	}*/
	
	$to = "benreimer9@gmail.com";
	$subject = "Test from SpeakAbout";
	$message = stripslashes($report);
	$headers = array('Content-Type: text/html; charset=UTF-8');
	wp_mail( $to, $subject, $message, $headers);
    die();
}









/** Options Admin */
add_action( 'admin_menu', 'speak_about_menu' );

function speak_about_menu() {
	add_options_page( 'SpeakAbout Options', 'SpeakAbout', 'manage_options', 'my-unique-identifier', 'speak_about_options' );
}

function speak_about_options() {
	if ( !current_user_can( 'manage_options' ) )  {
		wp_die( __( 'You do not have sufficient permissions to access this page.' ) );
	}
    echo '<div class="wrap">';
    echo '<h1>SpeakAbout Settings.</h1>';
	echo '<p>Here is where the form would go if I actually had options.</p>';
	echo '</div>';
}
 
?>
