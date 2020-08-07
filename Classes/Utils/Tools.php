<?php
namespace  Slub\SlubWebKartenforum\Utils;

class Tools {

	/**
	 * Finds out the actual logged in user
	 * @param \TYPO3\CMS\Extbase\Domain\Repository\FrontendUserRepository $repo
	 * @return \Slub\SlubWebKartenforum\Domain\Model\User $user
	 */
	public static function getActualUser($repo) {
		$user = $GLOBALS['TSFE']->fe_user->user;

		if (!$user)
			return null;

		$feUserObj = $repo->findByUid($user['uid']);
		return $feUserObj;
	}

	/**
	 * Functions renders the client setting parameters to the given template.
	 * @param array $settings
	 */
	public static function renderClientSettings($settings) {
		//
		// add client settings params
		//
		$GLOBALS['TSFE']->additionalHeaderData[] = '
		    <!-- checks if the vk2.settings module is already loaded -->
			<script>
				if (window["vk2"] === undefined) {
					goog.require("vk2.settings");
				};
			</script>
		';

		$GLOBALS['TSFE']->additionalHeaderData[] = '
			<script>
        		// parameters which are replaced by typo3 flexform parameters should be set at first because"
				// in other cases the fluid template engine throwns unknown exceptions
				vk2x.settings.WITH_SPEAKING_URLS = ' . $settings['general']['realurl'] . ' === 1 ? true: false;
				vk2x.settings.ELASTICSEARCH_NODE = "' .$settings['search']['elasticsearch']. '"
				vk2x.settings.ELASTICSEARCH_SRS = "EPSG:4326";
				vk2x.settings.EVALUATION_GETPROCESS = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Evaluation&tx_vk2_search[action]=getProcess&type=999" :
						"/evaluation/getprocess?type=999";
				vk2x.settings.EVALUATION_SETISVALIDE = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Evaluation&tx_vk2_search[action]=setIsValide&type=999" :
						"/evaluation/isvalide?type=999";
				vk2x.settings.EVALUATION_SETISINVALIDE = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Evaluation&tx_vk2_search[action]=setIsInValide&type=999" :
						"/evaluation/isinvalide?type=999";
				vk2x.settings.GEOREFERENCE_EXTENT_SRS = "EPSG:4326";
				vk2x.settings.GEOREFERENCE_CONFIRM = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Georeference&tx_vk2_search[action]=confirmGeorefProcess&type=999" :
						"/georef/confirm?type=999";
				vk2x.settings.GEOREFERENCE_GETPROCESS = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Georeference&tx_vk2_search[action]=getProcess&type=999" :
						"/georef/getprocess?type=999";
				vk2x.settings.GEOREFERENCE_HISTORY = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Georeference&tx_vk2_search[action]=georeferenceUserHistory&type=999" :
						"/georef/history?type=999";
				vk2x.settings.GEOREFERENCE_INFORMATION = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Georeference&tx_vk2_search[action]=georeferenceUserInformation&type=999" :
						"/georef/information?type=999";
				vk2x.settings.GEOREFERENCE_ON = ' .$settings['georef']['active'] .' === 1 ? true : false;
				vk2x.settings.GEOREFERENCE_PAGE = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Static&tx_vk2_search[action]=georefPage" :
						"/static/georefpage?";
				vk2x.settings.GEOREFERENCE_VALIDATION = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Georeference&tx_vk2_search[action]=validateGeorefProcess&type=999":
						"/georef/validation?type=999";
				vk2x.settings.MAIN_PAGE = !vk2x.settings.WITH_SPEAKING_URLS ?
						"id=' . $settings['general']['baseid'] . '" :
						"/vkviewer";
				vk2x.settings.MAPPROFILE_PAGE = !vk2x.settings.WITH_SPEAKING_URLS ?
						"tx_vk2_search[controller]=Static&tx_vk2_search[action]=profileMap" :
						"/static/profile-map?";
				vk2x.settings.MAPVIEW_PARAMS = {
					projection: "EPSG:3857",
					minResolution: 1.194328566789627,
					maxResolution: 2445.9849047851562,
					extent: [400000,5000000,4000000,8000000],
					center: [1528150, 6630500],
					zoom: 2
				};
				vk2x.settings.MODE_3D = ' . $settings['general']['mode3d'] . ' === 1 ? true : false;
				vk2x.settings.OSM_URLS = ["' . implode('","', explode(';', $settings['general']['openstreetmap'])) . '"];
				vk2x.settings.TERRAIN_TILES_URL = "' . $settings['general']['terraintiles'] . '";
				vk2x.settings.THUMB_PATH = "/typo3conf/ext/vk2/Resources/Public/images/layer_default.png";
				vk2x.settings.TMS_URL_SUBDOMAINS = [ "1", "2", "3" ];
				vk2x.settings.NOMINATIM_URL = "' . $settings['general']['nominatim'] . '";
				vk2x.settings.WMS_DYNAMIC_TEMPLATE = "' . $settings['georef']['dynamicwmsurl'] . '";

				// trigger to update the default values
				vk2.settings.updateSettings();
			</script>
		';
	}

	/**
	 * Functions renders the openlayers dependencies to the given template.
	 * @param array $settings
	 */
	public static function renderOpenlayersDependencies($settings) {
		// get relative typo path
		$relPath = \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::siteRelPath('vk2');

		//
		// render different js library regarding if production or debug mode
		//
		$debug = $settings['general']['debug'];
		if ($debug == 1) {
			$GLOBALS['TSFE']->additionalHeaderData[] = '
				<script type="text/javascript" src="'.$relPath.'Resources/Public/dist/ol-vk2.js"></script>
				<script type="text/javascript" src="'.$relPath.'Resources/Public/lib/closure-library/closure/goog/base.js"></script>
				<script type="text/javascript" src="'.$relPath.'Resources/Public/lib/closure-library/closure/goog/deps.js"></script>
				<script type="text/javascript" src="'.$relPath.'Resources/Public/src/vk2-deps.js"></script>';
		} else {
			$GLOBALS['TSFE']->additionalHeaderData[] = '
				<script type="text/javascript" src="'.$relPath.'Resources/Public/dist/ol-vk2.js"></script>
				<script type="text/javascript" src="'.$relPath.'Resources/Public/dist/vk2-min.js"></script>';
		};
	}
}
