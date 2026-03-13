const IMG_BASE = '/img/lake_house/';
const PROPERTY_KEY = 'lake_house';

function resolveImagePaths() {
    document.querySelectorAll('img[data-img]').forEach(img => {
        img.src = IMG_BASE + img.getAttribute('data-img');
    });
}
/**
 * Guest Guidebook - JavaScript
 * Handles accordion functionality, navigation, and data rendering
 * Supports bilingual content (EN/JP)
 */

// Initialize language state
window.currentLang = localStorage.getItem('siteLang') || 'en';

// ============================================
// ICONS (Monochrome SVG)
// ============================================
const ICONS = {
    // Access
    address: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
    parking: '<svg class="icon-inline" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>',
    car: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle></svg>',
    train: '<svg class="icon-inline" viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>',
    taxi: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',

    // Facilities
    checkin: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>',
    water: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>',
    amenities: '<svg class="icon-inline" viewBox="0 0 24 24"><polyline points="20 12 20 22 4 22 4 12"></polyline><rect x="2" y="7" width="20" height="5"></rect><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path></svg>',
    kitchen: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',
    bath: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M9 21h6"></path><path d="M5 21a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5z"></path></svg>', // Using generic tub/container shape or can use "cloud-drizzle"
    dishes: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>',
    condiments: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>', // Tag icon
    rentals: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>', // Zoom/Explore or similar
    ac: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path></svg>',
    wifi: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>',
    rooms: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>',
    trash: '<svg class="icon-inline" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>',

    // Neighborhood
    goods: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>',
    sightseeing: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>',
    restaurant: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>',

    // Rules
    cancel: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    smoke: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line></svg>', // Ban sign
    noise: '<svg class="icon-inline" viewBox="0 0 24 24"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>', // Mute/No Loud
    damage: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    time: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    money: '<svg class="icon-inline" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>',

    // FAQ
    luggage: '<svg class="icon-inline" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
    power: '<svg class="icon-inline" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>',
    receipt: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>',

    // Paid Services
    sup: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M3 18h18M12 6v8M8 10l4-4 4 4"></path><ellipse cx="12" cy="18" rx="9" ry="2"></ellipse></svg>',
    bbq: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="10" r="7"></circle><path d="M12 17v4M8 21h8M9 7v3M12 6v4M15 7v3"></path></svg>',
    clock: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>',
    bicycle: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="5.5" cy="17.5" r="3.5"></circle><circle cx="18.5" cy="17.5" r="3.5"></circle><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h3"></path></svg>',
    fishing: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M18 3v7c0 2.21-1.79 4-4 4h-2l-2 3-2-3H6c-2.21 0-4-1.79-4-4V3M12 14v7M10 21h4"></path></svg>',
    fire: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M12 22c-4.97 0-9-4.03-9-9 0-4 4-8 4-12 0 0 3 2 4 6 1.5-2 2-4 2-4s3 2.5 3 6c2-1 3-2.5 3-2.5s2 3.5 2 6.5c0 4.97-4.03 9-9 9z"></path></svg>',

    // Missing Icons
    tv: '<svg class="icon-inline" viewBox="0 0 24 24"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>',
    mic: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
    laundry: '<svg class="icon-inline" viewBox="0 0 24 24"><rect x="3" y="2" width="18" height="20" rx="2"></rect><circle cx="12" cy="13" r="5"></circle><path d="M12 18a5 5 0 0 1-5-5"></path></svg>',
    rules: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
    info: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
    check: '<svg class="icon-inline" viewBox="0 0 24 24"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>',
    phone: '<svg class="icon-inline" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>',
    help: '<svg class="icon-inline" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
};

// ============================================
// GUIDEBOOK DATA STRUCTURE (Bilingual)
// ============================================
const guidebookData = {
    propertyId: "557548",
    propertyName: "LAKE HOUSE Nojiriko",
    heroImage: "lake_house_main.jpg",
    // Access Section (Bilingual) - Now as items array
    access: {
        id: "access",
        title: { en: "Access & WiFi", jp: "アクセス ＆ WiFi" },
        items: [
            {
                icon: "checkin",
                title: { en: "Check-in Guide", jp: "チェックイン・アウト方法" },
                content: {
                    en: `<p>Open the key box on the door using the code <strong>0123</strong>.</p>
                        <div class="keybox-container">
                            <img data-img="tlh-keybox1.jpg" alt="Keybox Location" class="guidebook-img">
                            <img data-img="tlh-keybox2.jpg" alt="Keybox Detail" class="guidebook-img">
                        </div>
                        <div class="lh-time-block">
  <div class="lh-time-title">
    <span class="lh-time-icon">🕒</span>
    <span>Check-in / Check-out Time</span>
  </div>
  <div class="lh-time-grid">
    <div class="lh-time-item">
      <div class="lh-time-label">Check-in</div>
      <div class="lh-time-value">15:00–</div>
    </div>
    <div class="lh-time-item">
      <div class="lh-time-label">Check-out</div>
      <div class="lh-time-value">–11:00</div>
    </div>
  </div>
</div>
<p>- Since this is a self-check-in facility, you can check in anytime after 15:00.<br>
- Check-out is by 11:00. Please return the key to the key box upon departure to complete your check-out.</p>`,
                    jp: `<p style="font-weight: bold; font-size: 1.1em;">玄関ドアのドアノブに設置しているキーボックスは、暗証番号「<strong>0123</strong>」で解錠できます。</p>
                        <div class="keybox-container">
                            <img data-img="tlh-keybox1.jpg" alt="キーボックスの場所" class="guidebook-img">
                            <img data-img="tlh-keybox2.jpg" alt="キーボックス詳細" class="guidebook-img">
                        </div>
                        <div class="lh-time-block">
  <div class="lh-time-title">
    <span class="lh-time-icon">🕒</span>
    <span>チェックイン・チェックアウト時間</span>
  </div>
  <div class="lh-time-grid">
    <div class="lh-time-item">
      <div class="lh-time-label">チェックイン</div>
      <div class="lh-time-value">15:00〜</div>
    </div>
    <div class="lh-time-item">
      <div class="lh-time-label">チェックアウト</div>
      <div class="lh-time-value">〜11:00</div>
    </div>
  </div>
</div>
<p>・当施設はセルフチェックインとなっておりますので、15:00以降であればいつでもチェックインが可能です。<br>
・チェックアウトは11:00までとなっております。ご退出の際は、鍵をキーボックスへお戻しいただければお手続き完了となります。</p>`
                }
            },
            {
                icon: "wifi",
                title: { en: "WiFi", jp: "WiFi" },
                content: {
                    en: `<div class="wifi-container">
                            <div class="wifi-text">
                                <p><strong>Network 1:</strong> The Lake House - 2G<br>
                                <strong>Network 2:</strong> The Lake House - 5G<br>
                                <strong>Password:</strong> nojiriko</p>
                            </div>
                            <div class="wifi-image">
                                <img data-img="tlh-wifi.png" alt="WiFi QR Code" class="guidebook-img">
                            </div>
                        </div>`,
                    jp: `<div class="wifi-container">
                            <div class="wifi-text">
                                <p><strong>ネットワーク1:</strong> The Lake House - 2G<br>
                                <strong>ネットワーク2:</strong> The Lake House - 5G<br>
                                <strong>パスワード:</strong> nojiriko</p>
                            </div>
                            <div class="wifi-image">
                                <img data-img="tlh-wifi.png" alt="WiFi QRコード" class="guidebook-img">
                            </div>
                        </div>`
                }
            },
            {
                icon: "address",
                title: { en: "Address", jp: "住所" },
                content: {
                    en: `<div class="address-row">
                            <span class="address-text">54-3 Nojiri, Shinano-machi, Kamiminochi-gun, Nagano-ken</span>
                            <a href="https://maps.app.goo.gl/WKKEfmXAJ3Xa4vN19" target="_blank" rel="noopener noreferrer" class="maps-external-link">📍 Open in Google Maps</a>
                        </div>
                        <div class="map-embed">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1597.2!2d138.20995!3d36.82944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601d9b5ed77c4f59%3A0x8e2c30c5d3c5f3d8!2z6ZW36YeO55yM5LiK5rC05YaF6YOh5L-h5r-D55S66YeO5bC7NTTigJAz!5e0!3m2!1sja!2sjp!4v1699000000000" 
                                width="100%" 
                                height="250" 
                                style="border:0; border-radius: 8px;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>`,
                    jp: `<div class="address-row">
                            <span class="address-text">長野県上水内郡信濃町野尻54-3</span>
                            <a href="https://maps.app.goo.gl/WKKEfmXAJ3Xa4vN19" target="_blank" rel="noopener noreferrer" class="maps-external-link">📍 Google Mapsで開く</a>
                        </div>
                        <div class="map-embed">
                            <iframe 
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1597.2!2d138.20995!3d36.82944!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601d9b5ed77c4f59%3A0x8e2c30c5d3c5f3d8!2z6ZW36YeO55yM5LiK5rC05YaF6YOh5L-h5r-D55S66YeO5bC7NTTigJAz!5e0!3m2!1sja!2sjp!4v1699000000000" 
                                width="100%" 
                                height="250" 
                                style="border:0; border-radius: 8px;" 
                                allowfullscreen="" 
                                loading="lazy" 
                                referrerpolicy="no-referrer-when-downgrade">
                            </iframe>
                        </div>`
                }
            },
            {
                icon: "parking",
                title: { en: "Parking", jp: "駐車場" },
                content: {
                    en: `<p>Parking for 3 cars is available.</p>
                        <img data-img="parking_layout.jpg" alt="Parking Layout" class="access-image">`,
                    jp: `<p>乗用車3台分を駐車できます。</p>
                        <img data-img="parking_layout.jpg" alt="駐車場配置図" class="access-image">`
                }
            },
            {
                icon: "car",
                title: { en: "By Car", jp: "車で来る場合" },
                content: {
                    en: `<p>・Approx. 5 min by car from "Nojiriko IC" on Joshinetsu Expressway.<br>
                        ・Approx. 40 min by car from Nagano Station.<br>
                        ・Car rentals are available around Nagano Station, making it convenient for train travelers.</p>`,
                    jp: `<p>・上信越自動車道「野尻湖IC」から車で約5分。<br>
                        ・長野駅からは車で約40分と、アクセスも良好です。<br>
                        ・長野駅周辺ではレンタカーの手配も可能なので、電車でお越しの方も安心してご利用いただけます。</p>`
                }
            },
            {
                icon: "train",
                title: { en: "By Train", jp: "電車で来る場合" },
                content: {
                    en: `<p>・From Nagano Station, take the Shinano Railway Kita-Shinano Line for approximately 35 minutes.<br>
                        ・After arriving at Kurohime Station, please take a taxi to the property.</p>`,
                    jp: `<p>・長野駅よりしなの鉄道北しなの線で約35分。<br>
                        ・黒姫駅到着後は、タクシーをご利用ください。</p>`
                }
            },
            {
                icon: "taxi",
                title: { en: "Taxi Companies (Japanese only)", jp: "タクシー会社" },
                content: {
                    en: `<p><strong>Nojiriko Taxi:</strong> <a href="tel:026-219-2829" class="phone-link">026-219-2829</a></p>
                        <p><strong>Toriigawa Kanko Taxi:</strong> <a href="tel:026-255-3155" class="phone-link">026-255-3155</a></p>`,
                    jp: `<p><strong>野尻湖タクシー（株）:</strong> <a href="tel:026-219-2829" class="phone-link">026−219−2829</a></p>
                        <p><strong>鳥居川観光タクシー（株）:</strong> <a href="tel:026-255-3155" class="phone-link">026−255−3155</a></p>`
                }
            }
        ]
    },

    // Main Guide Sections
    sections: [
        {
            id: "greeting",
            title: { en: "Welcome", jp: "挨拶" },
            items: [
                {
                    icon: "info",
                    title: { en: "Message", jp: "メッセージ" },
                    content: {
                        en: `<p style="margin-bottom: 1.5rem;">Thank you very much for staying at The Lake House.</p>
                        <p style="margin-bottom: 1.5rem;">The Lake House is a lakeside retreat villa located directly on Lake Nojiri, within a national park. Surrounded by nature that changes beautifully with each season, you can enjoy authentic Finnish-style sauna experiences, natural underground water baths, and special moments on the spacious wooden deck.</p>
                        <p style="margin-bottom: 1.5rem;">Inside the villa, you will find a fireplace, karaoke, and board games. On the second floor, there are private bedrooms designed for comfort. It is an ideal space for families, group trips, or workations.</p>
                        <p style="margin-bottom: 1.5rem;">While the host is not physically present during your stay and support is provided online, please feel free to contact us anytime if you need assistance.</p>
                        <p>(Sincerely,<br>Customer Support & Cleaning Team)</p>`,
                        jp: `<p style="margin-bottom: 1.5rem;">この度は The Lake House にご宿泊いただき、誠にありがとうございます。</p>
                        <p style="margin-bottom: 1.5rem;">The Lake Houseは、野尻湖直結・国立公園内に佇むレイクサイドリトリートヴィラです。四季折々に表情を変える湖の自然に包まれながら、本格フィンランド式サウナや天然地下水の水風呂、広々としたウッドデッキで特別なひとときをお過ごしいただけます。</p>
                        <p style="margin-bottom: 1.5rem;">室内には薪暖炉やカラオケ、ボードゲームを備え、2階には独立したベッドルームをご用意。ご家族やグループ旅行、ワーケーションにも最適な空間です。</p>
                        <p style="margin-bottom: 1.5rem;">ホストは常駐しておらず、滞在中はオンラインでのご対応となりますが、お困りのことがございましたらいつでもお気軽にご連絡ください。</p>
                        <p>（カスタマーサポート・清掃スタッフ一同より）</p>`
                    }
                }
            ]
        },
        {
            id: "facility",
            title: { en: "Room & Equipment Guide", jp: "各部屋と備品のご案内" },
            items: [
                {
                    icon: "info",
                    title: { en: "Room & Equipment Overview", jp: "施設・設備の概要" },
                    content: {
                        en: `<p>Below is the floor plan of the property.<br>Using this layout, we will introduce each room and the equipment available throughout the house.</p>
                             <div class="floor-plans" style="margin-top: 1rem;">
                                 <p style="margin-bottom: 0.25rem; font-weight: bold;">1st Floor Plan</p>
                                 <img data-img="floor_plan_1f.png" alt="1st Floor Plan" class="living-image" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 1rem; display: block;">
                                 <p style="margin-bottom: 0.25rem; font-weight: bold;">2nd Floor Plan</p>
                                 <img data-img="floor_plan_2f.png" alt="2nd Floor Plan" class="living-image" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 0.5rem; display: block;">
                             </div>`,
                        jp: `<p>施設の平面図です。<br>このレイアウトに沿って、各部屋と設備をご紹介します。</p>
                             <div class="floor-plans" style="margin-top: 1rem;">
                                 <p style="margin-bottom: 0.25rem; font-weight: bold;">1階 平面図</p>
                                 <img data-img="floor_plan_1f.png" alt="1階 平面図" class="living-image" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 1rem; display: block;">
                                 <p style="margin-bottom: 0.25rem; font-weight: bold;">2階 平面図</p>
                                 <img data-img="floor_plan_2f.png" alt="2階 平面図" class="living-image" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 0.5rem; display: block;">
                             </div>`
                    }
                },
                {
                    icon: "tv",
                    title: { en: "Living Room", jp: "リビング" },
                    content: {
                        en: `<img data-img="room_living_final_locked.jpg" alt="Living Room" class="living-image" loading="lazy" style="width: 100%; height: auto; border-radius: 6px; margin-bottom: 1rem; object-fit: cover;">
                        <p style="margin-bottom: 0.5rem;">Enjoy these features in the Living Room</p>
                        
                        <details class="living-accordion">
                            <summary>・Professional DAM Karaoke System (4 Microphones)</summary>
                            <p>Equipped with 4 remotes, 2 microphones, tambourines, maracas, smoke items, and mic stands for large groups. (Available anytime, please mind volume at night.)</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・BOSE Speaker Powerful Sound</summary>
                            <p>Bluetooth compatible.</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・85-inch TV for Movies (Netflix, etc.)</summary>
                            <p>Netflix, Prime Video, Hulu, U-NEXT, Rakuten TV, ABEMA available (please log in with your own account).</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・British HALO Sofa - Supreme Comfort</summary>
                            <p>Luxurious feather down sofa from British furniture brand HALO. Experience cloud-like comfort you won't want to leave.</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・DR.VRANJES Premium Fragrance</summary>
                            <p>Enjoy high-quality fragrances.</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・British HALO Dining Table</summary>
                            <p>Georgian-style table from British furniture brand HALO. Upcycled from historic British timber (beams and pillars from actual British homes), with natural knots and nail marks adding character. Perfect for precious moments with friends and family.</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・Owner's Curated Interior</summary>
                            <p>Features the owner's carefully selected items for board sports enthusiasts. (Some items are fragile. Please ensure small children do not touch them.)</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・Board Games & Cards Available</summary>
                            <p>Board games, cards, and various games available.</p>
                        </details>`,
                        jp: `<img data-img="room_living_final_locked.jpg" alt="リビングルーム" class="living-image" loading="lazy" style="width: 100%; height: auto; border-radius: 6px; margin-bottom: 1rem; object-fit: cover;">
                        <p style="margin-bottom: 0.5rem;">リビングでは、こちらをお楽しみください</p>
                        
                        <details class="living-accordion">
                            <summary>・本格的なDAMカラオケ（マイク4本完備）</summary>
                            <p>大人数でもお楽しみいただけるようデンモク4つ、マイク2本、タンバリン、マラカス、スモークアイテムやマイクスタンドもご用意しております。（ご滞在中いつでもご利用いただけますが、夜間使用の際は音量にご注意下さい。）</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・BOSEスピーカーの迫力サウンド</summary>
                            <p>Bluetooth接続可能です。</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・85インチTVで映画鑑賞（Netflix他）</summary>
                            <p>NETFLIX、Prime video、hulu、U-NEXT、RakutenTV、ABEMAをご利用いただけます。（アカウントログインにつきましてはお客様ご自身でお願いいたします。）</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・英国HALOソファの極上の座り心地</summary>
                            <p>英国家具ブランドHALOよりフェザーダウンを贅沢に使用。まるで雲の上にいるかのような、抜け出せなくなってしまう心地よさをご体感下さい。</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・DR.VRANJESの上質な香り</summary>
                            <p>上質な香りをお楽しみいただけます。</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・英国HALOダイニングテーブル</summary>
                            <p>英国家具ブランドHALOよりジョージアン様式を採用。イギリスの家屋で実際に使用されていた梁や柱などの古材をアップサイクルしており、そのまま残された木のふしや釘の跡が味わいを増してくれます。ご友人やご家族との大切なひとときに是非ご利用下さいませ。</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・オーナーこだわりのインテリア</summary>
                            <p>横乗り好きオーナーこだわりアイテムも置いております。（壊れやすいものもございます。小さなお子様がお手を触れぬよう、ご注意願います。）</p>
                        </details>

                        <details class="living-accordion">
                            <summary>・ボードゲーム・トランプも完備</summary>
                            <p>ボードゲームやトランプ等、多数ご用意しております。</p>
                        </details>`
                    }
                },
                {
                    icon: "rooms",
                    title: { en: "Bedrooms", jp: "寝室" },
                    content: {
                        en: `<details class="living-accordion">
                            <summary>Bedroom 1 (7.5 tatami)</summary>
                            <div class="accordion-body">
                                <p>1 Double Bed, A/C, Bedside Table, Mini Fridge</p>
                                <img data-img="room_bedroom_1.jpg" alt="Bedroom 1" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>
                        <details class="living-accordion">
                            <summary>Bedroom 2 (7.5 tatami)</summary>
                            <div class="accordion-body">
                                <p>2 Single Beds, A/C, Bedside Table, Mini Fridge</p>
                                <img data-img="room_bedroom_2.jpg" alt="Bedroom 2" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>
                        <details class="living-accordion">
                            <summary>Bedroom 3 (6.0 tatami)</summary>
                            <div class="accordion-body">
                                <p>2 Single Beds, A/C, Bedside Table</p>
                                <img data-img="room_bedroom_3.jpg" alt="Bedroom 3" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>
                        <details class="living-accordion">
                            <summary>Bedroom 4 (9.0 tatami)</summary>
                            <div class="accordion-body">
                                <p>2 Semi-Double Beds, A/C, Side Table, Mini Fridge, LCD TV</p>
                                <img data-img="room_bedroom_4.jpg" alt="Bedroom 4" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>`,
                        jp: `<details class="living-accordion">
                            <summary>寝室①【洋室7.5帖】</summary>
                            <div class="accordion-body">
                                <p>ダブルベッド1台、エアコン、ベッドサイドテーブル、小型冷蔵庫</p>
                                <img data-img="room_bedroom_1.jpg" alt="寝室1" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>
                        <details class="living-accordion">
                            <summary>寝室②【洋室7.5帖】</summary>
                            <div class="accordion-body">
                                <p>シングルベッド2台、エアコン、ベッドサイドテーブル、小型冷蔵庫</p>
                                <img data-img="room_bedroom_2.jpg" alt="寝室2" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>
                        <details class="living-accordion">
                            <summary>寝室③【洋室6.0帖】</summary>
                            <div class="accordion-body">
                                <p>シングルベッド2台、エアコン、ベッドサイドテーブル</p>
                                <img data-img="room_bedroom_3.jpg" alt="寝室3" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>
                        <details class="living-accordion">
                            <summary>寝室④【洋室9.0帖】</summary>
                            <div class="accordion-body">
                                <p>セミダブルベッド2台、エアコン、サイドテーブル、小型冷蔵庫、テレビ</p>
                                <img data-img="room_bedroom_4.jpg" alt="寝室4" loading="lazy" style="width: 100%; height: auto; border-radius: 8px; margin-top: 0.5rem;">
                            </div>
                        </details>`
                    }
                },
                {
                    icon: "kitchen",
                    title: { en: "Kitchen", jp: "キッチン" },
                    content: {
                        en: `<div class="kitchen-gallery">
                            <div class="gallery-item">
                                <img data-img="kitchen_ih_stove.png" alt="IH Cooking Stove" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>IH Cooking Stove</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_cookware.png" alt="Cooking Tools & Pots" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Cooking Tools & Pots in Drawer</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_rice_cooker.png" alt="Rice Cooker" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Rice Cooker (ZOJIRUSHI)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_microwave.png" alt="Microwave" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Microwave (Panasonic)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_kettle.png" alt="Electric Kettle" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Electric Kettle (T-fal)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_ih_panel.png" alt="IH Battery Cover" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Battery Replacement - Open this cover</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_batteries.png" alt="Spare Batteries" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Spare Batteries Location</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_carbonated_server.png" alt="Sparkling Water Server" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Unlimited Sparkling Water Server - Pull the lever</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_fridge.jpg" alt="Refrigerator" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Refrigerator (Panasonic 470L)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_ice_maker.png" alt="HOSHIZAKI Ice Maker" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>HOSHIZAKI Ice Maker (Commercial)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_tableware_bowls.png" alt="Tableware Bowls" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Tableware (Bowls & Deep Plates)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_tableware_plates.png" alt="Tableware Plates" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Tableware (Assorted Plates)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_pans_pots.png" alt="Pots and Pans" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Pots, Pans & Strainer</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_hotplate_zojirushi.png" alt="Hot Plate" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>Hot Plate (ZOJIRUSHI)</strong></p>
                            </div>
                        </div>`,
                        jp: `<div class="kitchen-gallery">
                            <div class="gallery-item">
                                <img data-img="kitchen_ih_stove.png" alt="IHコンロ" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>IHコンロ</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_cookware.png" alt="調理器具・鍋" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>調理器具・鍋（引き出し内）</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_rice_cooker.png" alt="炊飯器" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>炊飯器（象印）</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_microwave.png" alt="電子レンジ" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>電子レンジ (Panasonic)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_kettle.png" alt="電気ケトル" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>電気ケトル (T-fal)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_ih_panel.png" alt="IHコンロ電池カバー" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>電池交換 - このカバーを開けてください</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_batteries.png" alt="予備電池" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>予備電池の保管場所</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_carbonated_server.png" alt="炭酸サーバー" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>炭酸サーバー使い放題 - レバーを引いてください</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_fridge.jpg" alt="冷蔵庫" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>冷蔵庫 (Panasonic 470L)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_ice_maker.png" alt="HOSHIZAKI製氷機" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>HOSHIZAKI製氷機 (業務用)</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_tableware_bowls.png" alt="食器類（木製ボウル・深皿）" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>食器類（木製ボウル・深皿）</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_tableware_plates.png" alt="食器類（平皿）" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>食器類（取り皿・平皿各種）</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_pans_pots.png" alt="鍋・フライパン" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>鍋・フライパン・ザル</strong></p>
                            </div>
                            <div class="gallery-item">
                                <img data-img="kitchen_hotplate_zojirushi.png" alt="ホットプレート" class="guidebook-img" loading="lazy">
                                <p class="gallery-caption"><strong>ホットプレート（象印）</strong></p>
                            </div>
                        </div>`
                    }
                },
                {
                    icon: "dishes",
                    title: { en: "Dishwasher", jp: "食洗機" },
                    content: {
                        en: `<div class="bedroom-grid">
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_detergent_box.jpg" alt="Detergent Box" loading="lazy">
                                    <p style="margin-top: 0.5rem;">1. Detergent is in the clear box.</p>
                                </div>
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_detergent_in.jpg" alt="Place Detergent" loading="lazy">
                                    <p style="margin-top: 0.5rem;">2. Place detergent inside with dishes.</p>
                                </div>
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_power_on.jpg" alt="Power On" loading="lazy">
                                    <p style="margin-top: 0.5rem;">3. Press Power button to turn ON.</p>
                                </div>
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_start.jpg" alt="Start Button" loading="lazy">
                                    <p style="margin-top: 0.5rem;">4. Press Start/Pause button to begin.</p>
                                </div>
                            </div>`,
                        jp: `<div class="bedroom-grid">
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_detergent_box.jpg" alt="洗剤ボックス" loading="lazy">
                                    <p style="margin-top: 0.5rem;">① 洗剤は透明なボックスの中に入っています。</p>
                                </div>
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_detergent_in.jpg" alt="洗剤投入" loading="lazy">
                                    <p style="margin-top: 0.5rem;">② 洗剤は食器と一緒に食洗機の中に入れてください。</p>
                                </div>
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_power_on.jpg" alt="電源オン" loading="lazy">
                                    <p style="margin-top: 0.5rem;">③ 電源ボタンを先に押して、電源をオンにしてください。</p>
                                </div>
                                <div class="bedroom-item">
                                    <img data-img="dishwasher_start.jpg" alt="スタート" loading="lazy">
                                    <p style="margin-top: 0.5rem;">④ 電源を入れた後に、スタートボタンを押してください。</p>
                                </div>
                            </div>`
                    }
                },
                {
                    icon: "fire",
                    title: { en: "Fireplace", jp: "暖炉" },
                    content: {
                        en: `<img data-img="fireplace_main_view.jpg" alt="Fireplace" loading="lazy" style="width: 100%; border-radius: 6px; display: block; margin-bottom: 1rem;">
                        <p>Please watch the video guide to operate the fireplace.</p>
                        
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <a href="https://youtu.be/Tf3PxzmNuEg" target="_blank" style="font-size: 1.1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ Watch the video</a>
                        </div>

                        <p><strong>Important:</strong> Return gas cans to their original location. Ensure safety to prevent fire hazards.</p>`,
                        jp: `<img data-img="fireplace_main_view.jpg" alt="暖炉" loading="lazy" style="width: 100%; border-radius: 6px; display: block; margin-bottom: 1rem;">
                        <p>こちらの動画を参考に、暖炉を付けてください。</p>
                        
                        <div style="text-align: center; margin: 1.5rem 0;">
                            <a href="https://youtu.be/mqgpitTxbFs?si=4oII_euTyGa-7ty7" target="_blank" style="font-size: 1.1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ 動画はこちら</a>
                        </div>

                        <p>※ガス缶は元の場所に戻してください。<br>
                        ※火災の原因にもなりますので、必ずご確認お願いいたします。</p>`
                    }
                },
                {
                    icon: "mic",
                    title: { en: "Karaoke", jp: "カラオケ" },
                    content: {
                        en: `<p>1. Switch TV input to HDMI 1.</p>
                        <p>2. Press the 3 power buttons (see image).</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0;">
                            <div style="text-align: center;">
                                <img data-img="karaoke_power_1.png" alt="Power Button 1" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン①<br>Power Button 1</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="karaoke_power_2.png" alt="Power Button 2" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン②<br>Power Button 2</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="karaoke_power_3.png" alt="Power Button 3" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン③<br>Power Button 3</p>
                            </div>
                        </div>

                        <p><strong>Note:</strong> Takes about 3 minutes to boot if all power was off.</p>
                        <p>If unsure, please watch the video guide.</p>
                        
                        <div style="text-align: center; margin-top: 1.5rem; display: flex; flex-direction: column; align-items: center;">
                            <a href="https://youtu.be/1LvFFlsleFU?si=jcmT-_X8WC8poRR6" target="_blank" style="font-size: 1.1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ Watch the video</a>
                        </div>`,
                        jp: `<p>① テレビのリモコンの入力切り替えでHDMI1に合わせる。</p>
                        <p>② 3ヶ所の電源ボタンを押す→写真参照</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0;">
                            <div style="text-align: center;">
                                <img data-img="karaoke_power_1.png" alt="電源ボタン1" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン①<br>Power Button 1</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="karaoke_power_2.png" alt="電源ボタン2" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン②<br>Power Button 2</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="karaoke_power_3.png" alt="電源ボタン3" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン③<br>Power Button 3</p>
                            </div>
                        </div>

                        <p>※電源が全て切れている場合は3分ほど、起動までお時間がかかります。</p>
                        <p>わからない場合はこちらの動画をご視聴ください。</p>
                        
                        <div style="text-align: center; margin-top: 1.5rem; display: flex; flex-direction: column; align-items: center;">
                            <a href="https://youtu.be/J8my_fAeips?si=GHByJDhppzugD4RM" target="_blank" style="font-size: 1.1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ 動画はこちら</a>
                        </div>`
                    }
                },
                {
                    icon: "laundry",
                    title: { en: "Washing Machine", jp: "洗濯機" },
                    content: {
                        en: `<p>Follow the steps to Wash / Wash & Dry / Dry.</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0;">
                            <div style="text-align: center;">
                                <img data-img="washing_new_1.png" alt="Step 1 Power" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Step 1: Power</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="washing_new_2_en.png" alt="Step 2 Select Course" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Step 2: Select Mode</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="washing_new_3.png" alt="Step 3 Start" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Step 3: Start</p>
                            </div>
                        </div>

`,
                        jp: `<p>こちらの手順で洗濯と乾燥が可能です。②の際に洗濯・洗乾燥・乾燥の三つよりコースがお選びできます。</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin: 1rem 0;">
                            <div style="text-align: center;">
                                <img data-img="washing_new_1.png" alt="手順1 電源" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">手順① 電源</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="washing_new_2_jp.png" alt="手順2 コース選択" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">手順② コース選択</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="washing_new_3.png" alt="手順3 スタート" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">手順③ スタート</p>
                            </div>
                        </div>

`
                    }
                },
                {
                    icon: "water",
                    title: { en: "Water Heater", jp: "給湯器" },
                    content: {
                        en: `<p>Hot water is available in the kitchen and bathroom.</p>
                        <p>Turn on the control panel to use hot water.</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0;">
                            <div style="text-align: center;">
                                <img data-img="water_heater_1.png" alt="Kitchen Control Panel" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Control Panel (Kitchen)</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="water_heater_2.png" alt="Bathroom Control Panel" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Control Panel (Bathroom)</p>
                            </div>
                        </div>

                        <p><strong>Note:</strong> Set temperature to 60°C (Kitchen) or 40-42°C (Shower).</p>`,
                        jp: `<p>キッチンとお風呂で温水が使えます。</p>
                        <p>お湯を使う際は、壁の給湯パネルの電源を入れてください。</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin: 1rem 0;">
                            <div style="text-align: center;">
                                <img data-img="water_heater_1.png" alt="キッチン給湯パネル" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">キッチン給湯パネル</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="water_heater_2.png" alt="浴室給湯パネル" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">浴室給湯パネル</p>
                            </div>
                        </div>

                        <p>※シャワー温度は40〜42℃に設定してご使用ください。給湯温度は60℃推奨です。</p>`
                    }
                },
                {
                    icon: "bath",
                    title: { en: "Bath", jp: "お風呂" },
                    content: {
                        en: `<p>・Equipped with Jet Bath<br>
                        ・Bathroom equipped with 5-level dimming light</p>
                        <img data-img="bath_water_heater_guide_en.png" alt="Bath Operation Guide" class="living-image" loading="lazy" style="width: 100%; border-radius: 6px; margin-top: 1rem;">`,
                        jp: `<p>・ジェットバス付き浴槽完備<br>
                        ・浴室内 5段階調光完備</p>`
                    }
                },
                {
                    icon: "bath",
                    title: { en: "Jacuzzi", jp: "ジャグジー" },
                    content: {
                        en: `<p>1. Open the switch panel next to Jacuzzi and turn it on.</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 320px; margin: 0.5rem auto 1rem auto;">
                            <div style="text-align: center;">
                                <img data-img="jacuzzi_1_panel_loc.png" alt="Switch Panel Location" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Location</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="jacuzzi_2_panel_on_v2.png" alt="Switch Panel ON" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Switch ON</p>
                            </div>
                        </div>

                        <p>2. Turn on the Jacuzzi power button.</p>

                        <div style="text-align: center; margin: 0.5rem 0 1.5rem 0;">
                            <img data-img="jacuzzi_3_main_power.png" alt="Jacuzzi Main Power" style="max-width: 100%; width: 200px; border-radius: 6px;">
                            <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Power Button</p>
                        </div>

                        <p><strong>Filling:</strong> Use the faucet (not water heater). Close Drain Valves 1 & 2.</p>
                        


                        <p><strong>Draining:</strong> Open Drain Valves 1 & 2. Drain completely after use.</p>

                        <div style="text-align: center; margin: 0.5rem 0 1.5rem 0;">
                            <img data-img="jacuzzi_6_drain2.png" alt="Drain Valve 2" style="max-width: 100%; width: 200px; border-radius: 6px;">
                            <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">Drain Valve 2</p>
                        </div>

                        <p><strong>Notes:</strong> No food/drink inside. Auto-fill takes too long, follow manual fill instructions.</p>
                        <p><strong>Hot Shower:</strong> Available Mar-Nov (¥10,000/day extra).</p>
                        
                        <div style="text-align: center; margin-top: 2rem;">
                            <a href="https://youtu.be/aJrpjuaGSaU" target="_blank" style="font-size: 1.1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ Watch the video</a>
                        </div>`,
                        jp: `<p>① ジャグジー横にあるスイッチパネルを開け電源を入れる。</p>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; max-width: 320px; margin: 0.5rem auto 1rem auto;">
                            <div style="text-align: center;">
                                <img data-img="jacuzzi_1_panel_loc.png" alt="パネル場所" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">場所</p>
                            </div>
                            <div style="text-align: center;">
                                <img data-img="jacuzzi_2_panel_on_v2.png" alt="電源ON" style="width: 100%; height: auto; border-radius: 6px; aspect-ratio: 1/1; object-fit: cover;">
                                <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ON</p>
                            </div>
                        </div>

                        <p>② ジャグジー本体の電源を入れる。</p>

                        <div style="text-align: center; margin: 0.5rem 0 1.5rem 0;">
                            <img data-img="jacuzzi_3_main_power.png" alt="ジャグジー電源ボタン" style="max-width: 100%; width: 200px; border-radius: 6px;">
                            <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">電源ボタン</p>
                        </div>

                        <p><strong>&lt;水を貯める&gt;</strong> 給湯器ではなくこちらの蛇口を捻ってお使いください。水を貯める場合は排水弁①と排水弁②を閉じてください</p>
                        


                        <p><strong>&lt;排水する&gt;</strong> 排水弁①と排水弁②両方開けてください。※使用後は完全に排水をお願いします</p>

                        <div style="text-align: center; margin: 0.5rem 0 1.5rem 0;">
                            <img data-img="jacuzzi_6_drain2.png" alt="排水弁2" style="max-width: 100%; width: 200px; border-radius: 6px;">
                            <p style="font-size: 0.75rem; color: #a0a0a0; margin-top: 4px; line-height: 1.2;">排水弁②</p>
                        </div>

                        <p>※ジャグジー内での飲食は禁止です。※自動のお湯炊きだと時間かかるので、必ず上記の説明通りにお試しください。</p>
                        <p>【温シャワー完備】※3月~11月のみ利用可能※別途一日あたり10,000円頂いております。</p>
                        
                        <div style="text-align: center; margin-top: 2rem;">
                            <a href="https://youtu.be/SpEQfq_WBWw?si=m--POS1PmrwOvkvZ" target="_blank" style="font-size: 1.1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ 動画はこちら</a>
                        </div>`
                    }
                },
                {
                    icon: "sightseeing",
                    title: { en: "Balcony", jp: "バルコニー" },
                    content: {
                        en: `<img data-img="balcony_overview_final.jpg" alt="Balcony View" class="living-image" loading="lazy" style="width: 100%; display: block; margin: 0 auto 1rem;">
                        <p>After enjoying the cold bath, spend a relaxing time on the balcony.</p>
                        <p>Equipped with high-quality French sauna chairs and other amenities for your relaxation.</p>
                        
                        <p>・4 French Sauna Chairs (Lafuma MOBILIER)<br>
                        ・2 Side Tables<br>
                        ・Custom Wood Table<br>
                        ・Fixed Shower (※Not available in winter)</p>
                        
                        <div class="warning-box">
                            <strong>Rules:</strong> Quiet hours after 10 PM. No jumping into the lake (dangerous). Do not bury alcohol in snow.
                        </div>`,
                        jp: `<img data-img="balcony_overview_final.jpg" alt="Balcony View" class="living-image" loading="lazy" style="width: 100%; display: block; margin: 0 auto 1rem;">
                        <p>こだわりの水風呂を楽しんだ後は、バルコニーでゆったりとした癒しの時間をお過ごしください。</p>
                        <p>フランス輸入の高品質サウナチェアをはじめ、くつろぎのための設備を充実させています。</p>

                        <p>・フランス輸入サウナチェア（Lafuma MOBILIER）4台完備<br>
                        ・サイドテーブル 2台完備<br>
                        ・特注ウッドテーブル完備<br>
                        ・固定式シャワー完備（※冬季は使用不可）</p>
                        
                        <div class="warning-box">
                            <strong>【注意事項】</strong><br>
                            夜22時以降は、バルコニーではお静かにお過ごしください。<br>
                            日没後に湖へ飛び込む行為は大変危険なため、固く禁止しております。<br>
                            また、雪の中にお酒を埋めて冷やす行為はご遠慮ください。
                        </div>`
                    }
                },
                {
                    icon: "bbq",
                    title: { en: "BBQ", jp: "BBQ" },
                    content: {
                        en: `<p>Lighter, grill net, and tongs are stored on the upper kitchen shelf.<br>Please refer to the video below for usage instructions.</p>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <img data-img="bbq_shelf.png" alt="BBQ Tools Shelf" style="width: 85%; height: auto; border-radius: 6px; display: block; margin: 0 auto 1rem;">
                            <div style="text-align: center;">
                                <a href="https://youtu.be/P64SbH-GK3I?si=z_PJTQ1tvNLq4oeN" target="_blank" style="font-size: 1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ Watch the video</a>
                            </div>
                        </div>`,
                        jp: `<p>BBQに使用するチャッカマン・網・トングは、キッチン上部の棚にまとめて置いてあります。<br>ご利用方法については、下記の動画よりご確認ください。</p>
                        
                        <div style="margin-bottom: 1.5rem;">
                            <img data-img="bbq_shelf.png" alt="キッチンの棚" style="width: 85%; height: auto; border-radius: 6px; display: block; margin: 0 auto 1rem;">
                            <div style="text-align: center;">
                                <a href="https://youtu.be/wdCWkTrMGVM?si=5DMPr1CN-Xbc3pBE" target="_blank" style="font-size: 1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ 動画はこちら</a>
                            </div>
                        </div>`
                    }
                },
                {
                    icon: "bath",
                    title: { en: "Sauna", jp: "サウナ" },
                    content: {
                        en: `<div style="margin-bottom: 1.5rem;">
                            <img data-img="sauna_interior.jpg" alt="Sauna Interior" loading="lazy" style="width: 100%; border-radius: 6px; display: block; margin-bottom: 1rem;">
                            <div style="text-align: center;">
                                <a href="https://youtu.be/ISriUrQr0fw" target="_blank" style="font-size: 1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ Watch the video</a>
                            </div>
                        </div>

                        <p>Private sauna with Lake Nojiri views. Max 6 people.</p>
                        <p>Authentic Finnish sauna with HARVIA LEGEND 300 stove. Enjoy Löyly (Birch scent).</p>

                        <p><strong>[Equipment]</strong><br>
                        ・HARVIA LEGEND 300 Sauna Stove<br>
                        ・Löyly Set (Birch scent)<br>
                        ・Sauna Mats, Towels<br>
                        ・100% Merino Wool Sauna Hats<br>
                        ・Bose Mobile Speaker<br>
                        ・Blower (for self-aufguss)<br>
                        ・FIRESIDE Gloves, Firestarters</p>

                        <p>For detailed instructions and safety notes, please check the video link above.</p>

                        <p>Please return gas cans to basket.</p>`,
                        jp: `<div style="margin-bottom: 1.5rem;">
                            <img data-img="sauna_interior.jpg" alt="サウナ室内" loading="lazy" style="width: 100%; border-radius: 6px; display: block; margin-bottom: 1rem;">
                            <div style="text-align: center;">
                                <a href="https://youtu.be/v6iS16Tut7Y?si=uXCAuOMR2egn4KwT" target="_blank" style="font-size: 1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ 動画はこちら</a>
                            </div>
                        </div>

                        <p>オーナーこだわりの特注サウナルームです。最大6名までご利用いただけます。</p>
                        <p>HARVIA LEGEND 300 ストーブを備えた本格フィンランド式サウナで、ロウリュ（白樺の香り）をお楽しみいただけます。</p>

                        <p><strong>【設備】</strong><br>
                        ・HARVIA LEGEND 300 サウナストーブ<br>
                        ・ロウリュセット（白樺の香り）<br>
                        ・サウナマット、タオル<br>
                        ・メリノウール100％ サウナハット<br>
                        ・Bose モバイルスピーカー<br>
                        ・ブロアー（セルフアウフグース可）<br>
                        ・FIRESIDE 革手袋、着火剤</p>

                        <p>サウナの詳しい使い方・注意事項は、上記の動画リンクをご確認ください。</p>

                        <p>※使用後はガス缶をカゴに戻してください。</p>`
                    }
                },
                {
                    icon: "water",
                    title: { en: "Cold Bath", jp: "水風呂" },
                    content: {
                        en: `<div style="margin-bottom: 1.5rem;">
                            <img data-img="coldbath_overview.jpg" alt="Cold Bath Overview" loading="lazy" style="width: 100%; border-radius: 6px; display: block; margin-bottom: 1rem;">
                            <div style="text-align: center;">
                                <a href="https://youtu.be/Bcm0XWvI9-4?si=pK6SoINnkIhS33jO" target="_blank" style="font-size: 1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ Watch the video</a>
                            </div>
                        </div>
                        
                        <p>Discover our custom-built cold bath, abundantly fed by pure natural underground water. With a consistent temperature of 14°C year-round and a continuous flow of 100L/min, this 140cm deep bath offers an exceptional way to cool down and rejuvenate after your sauna session.</p>`,
                        jp: `<div style="margin-bottom: 1.5rem;">
                            <img data-img="coldbath_overview.jpg" alt="水風呂" loading="lazy" style="width: 100%; border-radius: 6px; display: block; margin-bottom: 1rem;">
                            <div style="text-align: center;">
                                <a href="https://youtu.be/G2KMmnzEasQ?si=L2suDgPHT5XI9gpG" target="_blank" style="font-size: 1rem; font-weight: bold; color: #fff; text-decoration: underline; text-underline-offset: 4px;">▶ 動画はこちら</a>
                            </div>
                        </div>
                        
                        <p>年間を通して水温14℃、毎分100Lの豊富な天然地下水を掛け流しで使用した贅沢な水風呂です。深さ140cmの特注浴槽で、サウナの後に格別の清涼感と「整う」体験をお楽しみください。</p>`
                    }
                },
                {
                    icon: "amenities",
                    title: { en: "Amenities", jp: "アメニティ" },
                    content: {
                        en: `<p><strong>Amenities:</strong></p>
                        <p>・Shampoo (ecostore)<br>
                            ・Conditioner (ecostore)<br>
                                ・Body Soap (ecostore)<br>
                                    ・Bath Towel<br>
                                        ・Body Towel<br>
                                            ・Toothbrush<br>
                                                ・Hair Dryer (Panasonic)</p>`,
                        jp: `<p><strong>【アメニティ】</strong></p>
                                            <p>・シャンプー（ecostore）<br>
                                                ・コンディショナー（ecostore）<br>
                                                    ・ボディソープ（ecostore）<br>
                                                        ・バスタオル<br>
                                                            ・ボディタオル<br>
                                                                ・歯ブラシ<br>
                                                                    ・ドライヤー（Panasonic）</p>`
                    }
                },

                {
                    icon: "rooms",
                    title: { en: "Toilet", jp: "トイレ" },
                    content: {
                        en: `<p>There are two separate toilets for men and women. Please use them accordingly.</p>`,
                        jp: `<p>男女別で2個あるので、使い分けてご使用ください。</p>`
                    }
                },
                {
                    icon: "trash",
                    title: { en: "Trash Rules", jp: "ゴミ箱" },
                    content: {
                        en: `<p><strong>Separation:</strong> Burnable, Non-burnable, Cans, PET bottles, Glass.<br>
                        <strong>Trash Location:</strong> Please place sorted trash in the designated area shown in the red frame below.<br>
                        <strong>At Checkout:</strong> Please gather all trash and leave it near the designated area in the living room.<br>
                        <strong>Long-term Guests:</strong> If you need trash collection, please contact us via the booking site.</p>
                        <img data-img="trashbox.png" alt="Trash Box" class="guidebook-image" loading="lazy">`,
                        jp: `<p><strong>分別：</strong>可燃ゴミ、不燃ゴミ、缶、ペットボトル、瓶<br>
                        <strong>ゴミの置き場所：</strong>画像の赤枠で示された場所にまとめて置いてください。<br>
                        <strong>チェックアウト時：</strong>ゴミはすべてリビングの赤枠付近に一箇所にまとめてください。<br>
                        <strong>長期滞在のお客様：</strong>ゴミの回収が必要な際は、予約サイトのメッセージよりご連絡ください。</p>
                        <img data-img="trashbox.png" alt="ゴミ箱" class="guidebook-image" loading="lazy">`
                    }
                }
            ]
        },
        {
            id: "neighborhood",
            title: { en: "Neighborhood", jp: "近隣情報" },
            items: [
                {
                    icon: "goods",
                    title: { en: "Supermarkets & Daily Goods", jp: "生活用品・スーパー" },
                    content: {
                        en: `<ul class="guide-list neighborhood-list two-col">
                                                                            <li><strong>7-Eleven Nojiriko</strong> (3 min drive / 25 min walk)<br><a href="https://maps.app.goo.gl/G9RWM8weuvCBwHWE8" target="_blank">View Map</a></li>
                                                                            <li><strong>Gas Station ENEOS Nojiriko SS</strong> (3 min drive)<br><a href="https://maps.app.goo.gl/AwKBxDQRZknxXWaUA" target="_blank">View Map</a></li>
                                                                            <li><strong>7-Eleven Shinanomachi Furuma</strong> (10 min drive)<br><a href="https://maps.app.goo.gl/MWjSvAo96oqHvm9m7" target="_blank">View Map</a></li>
                                                                        </ul>
                                                                        <details class="neighborhood-more">
                                                                            <summary>
                                                                                <span class="show-more">▶ Show more</span>
                                                                                <span class="show-less">▼ Show less</span>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li><strong>Matsumoto Kiyoshi</strong> (Drugstore, 10 min drive)<br><a href="https://maps.app.goo.gl/RsZJ9Vxb7pGENTUQ7" target="_blank">View Map</a></li>
                                                                                <li><strong>Komeri</strong> (Home Center, 10 min drive)<br><a href="https://maps.app.goo.gl/qUL7xc5uUWoJMPw79" target="_blank">View Map</a></li>
                                                                                <li><strong>Minemura Sake Shop</strong> (10 min drive)<br><a href="https://maps.app.goo.gl/GmhirMwhEaAkA3SRA" target="_blank">View Map</a></li>
                                                                                <li><strong>Daiichi Supermarket</strong> (10 min drive)<br><a href="https://maps.app.goo.gl/oroYjsQDXvs9zWwn6" target="_blank">View Map</a></li>
                                                                            </ul>
                                                                        </details>`,
                        jp: `<ul class="guide-list neighborhood-list two-col">
                                                                            <li>
                                                                                <strong>セブンイレブン野尻湖店</strong>
                                                                                <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩25分)</div>
                                                                                <a href="https://www.google.com/maps/search/?api=1&query=セブンイレブン野尻湖店" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                            </li>
                                                                            <li>
                                                                                <strong>ガソリンスタンドENEOS 野尻湖SS</strong>
                                                                                <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩24分)</div>
                                                                                <a href="https://www.google.com/maps/search/?api=1&query=ガソリンスタンドENEOS野尻湖SS" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                            </li>
                                                                            <li>
                                                                                <strong>セブンイレブン信濃町古間店</strong>
                                                                                <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                                                                                <a href="https://www.google.com/maps/search/?api=1&query=セブンイレブン信濃町古間店" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                            </li>
                                                                        </ul>
                                                                        <details class="neighborhood-more">
                                                                            <summary>
                                                                                <span class="show-more">▶ もっと見る</span>
                                                                                <span class="show-less">▼ 閉じる</span>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li>
                                                                                    <strong>マツモトキヨシ古間店</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=マツモトキヨシ古間店" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                                <li>
                                                                                    <strong>ホームセンターコメリ 信濃町店</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=ホームセンターコメリ信濃町店" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                                <li>
                                                                                    <strong>みねむら酒店</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=みねむら酒店" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                                <li>
                                                                                    <strong>スーパーマーケット第一スーパー古間店</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=スーパーマーケット第一スーパー古間店" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                            </ul>
                                                                        </details>`
                    }
                },
                {
                    icon: "restaurant",
                    title: { en: "Dining: Western & Cafe", jp: "食事：洋食・カフェ" },
                    content: {
                        en: `<h4 class="guide-sub-title gold-underline">Italian</h4>
                                                                        <details class="living-accordion">
                                                                            <summary>
                                                                                <div>
                                                                                    <strong style="display: block; margin-bottom: 0.25rem;">Funagoya</strong>
                                                                                    <a href="https://maps.app.goo.gl/UTGMEnHbVUd4nEMt9" target="_blank" style="font-weight: normal; font-size: 0.9rem;">View Map</a>
                                                                                </div>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li><strong>Terra</strong><br><a href="https://maps.app.goo.gl/bvsg8gmxt7ARfFV78" target="_blank">View Map</a></li>
                                                                                <li><strong>Nicoli</strong><br><a href="https://maps.app.goo.gl/3PXMN6TghEhUyzEp7" target="_blank">View Map</a></li>
                                                                                <li><strong>Restaurant Rudolf</strong><br><a href="https://maps.app.goo.gl/C2N41Ku3MATQNBcF8" target="_blank">View Map</a></li>
                                                                            </ul>
                                                                        </details>
                                                                        <h4 class="guide-sub-title gold-underline">Hamburger & Western</h4>
                                                                        <details class="living-accordion">
                                                                            <summary>
                                                                                <div>
                                                                                    <strong style="display: block; margin-bottom: 0.25rem;">Lamp Nojiriko</strong>
                                                                                    <a href="https://maps.app.goo.gl/WjK4gYTUV2uPQpms5" target="_blank" style="font-weight: normal; font-size: 0.9rem;">View Map</a>
                                                                                </div>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li><strong>Arrowhead Tavern</strong><br><a href="https://maps.app.goo.gl/Yi2MTGhadx9iZQaw9" target="_blank">View Map</a></li>
                                                                                <li><strong>Lumber jack</strong><br><a href="https://maps.app.goo.gl/woFffzQ9f1bkPExx8" target="_blank">View Map</a></li>
                                                                            </ul>
                                                                        </details>
                                                                        <h4 class="guide-sub-title gold-underline">Cafe & Bakery</h4>
                                                                        <details class="living-accordion">
                                                                            <summary>
                                                                                <div>
                                                                                    <strong style="display: block; margin-bottom: 0.25rem;">MYOKO COFFEE</strong>
                                                                                    <a href="https://maps.app.goo.gl/ZfZi2q3FnZJDHYt19" target="_blank" style="font-weight: normal; font-size: 0.9rem;">View Map</a>
                                                                                </div>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li><strong>EN Bakery 39</strong><br><a href="https://maps.app.goo.gl/H1krSAdkcu498NXM6" target="_blank">View Map</a></li>
                                                                            </ul>
                                                                        </details>
`,
                        jp: `<h4 class="guide-sub-title gold-underline">イタリアン</h4>
                                                                        <details class="living-accordion">
                                                                            <summary>
                                                                                <div>
                                                                                    <strong style="display: block; margin-bottom: 0.25rem;">Funagoya舟小屋</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩16分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=Funagoya舟小屋" target="_blank" rel="noopener noreferrer" style="font-weight: normal; font-size: 0.9rem;">地図を見る</a>
                                                                                </div>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li>
                                                                                    <strong>イタリア料理 テルラ</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=イタリア料理テルラ" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                                <li>
                                                                                    <strong>Nicoli</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で15分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=Nicoli" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                                <li>
                                                                                    <strong>レストランルドルフ</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で25分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=レストランルドルフ" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                            </ul>
                                                                        </details>
                                                                        <h4 class="guide-sub-title gold-underline">ハンバーガー・洋食</h4>
                                                                        <details class="living-accordion">
                                                                            <summary>
                                                                                <div>
                                                                                    <strong style="display: block; margin-bottom: 0.25rem;">Lamp野尻湖</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で4分 / 徒歩26分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=Lamp野尻湖" target="_blank" rel="noopener noreferrer" style="font-weight: normal; font-size: 0.9rem;">地図を見る</a>
                                                                                </div>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li>
                                                                                    <strong>Arrowhead Tavern</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩16分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=Arrowhead+Tavern" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                                <li>
                                                                                    <strong>Lumber jack</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で16分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=Lumber+jack" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                            </ul>
                                                                        </details>
                                                                        <h4 class="guide-sub-title gold-underline">カフェ・パン屋</h4>
                                                                        <details class="living-accordion">
                                                                            <summary>
                                                                                <div>
                                                                                    <strong style="display: block; margin-bottom: 0.25rem;">MYOKO COFFEE 高原駅前</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で9分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=MYOKO+COFFEE+高原駅前" target="_blank" rel="noopener noreferrer" style="font-weight: normal; font-size: 0.9rem;">地図を見る</a>
                                                                                </div>
                                                                            </summary>
                                                                            <ul class="guide-list neighborhood-list two-col" style="margin-top: 1rem;">
                                                                                <li>
                                                                                    <strong>EN　ベーカリー39</strong>
                                                                                    <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩15分)</div>
                                                                                    <a href="https://www.google.com/maps/search/?api=1&query=EN+ベーカリー39" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                                </li>
                                                                            </ul>
                                                                        </details>`
                    }
                },
                {
                    icon: "restaurant",
                    title: { en: "Dining: Japanese & Asian", jp: "食事：和食・中華・その他" },
                    content: {
                        en: `<div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    Japanese(Soba, etc.) <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>Issa Shokudo</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 3 min / On foot: 16 min)</div>
                        <a href="https://maps.app.goo.gl/XLfyapZ5Q18Sbtfx6" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Shinanoya (Soba)</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 8 min)</div>
                        <a href="https://maps.app.goo.gl/ygT2EQkCH6XDHxE68" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Restaurant Kiju</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 3 min / On foot: 29 min)</div>
                        <a href="https://maps.app.goo.gl/uDQRMJ9VLrtyq6Pt5" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Sobadokoro Takasawa</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 10 min)</div>
                        <a href="https://maps.app.goo.gl/VDjwwczuSCyfd3bj7" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Jurin (Tonkatsu)</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 10 min)</div>
                        <a href="https://maps.app.goo.gl/5VVSB9mKbypkdTtt8" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Kirakuen</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 15 min)</div>
                        <a href="https://maps.app.goo.gl/v2sRJLwR4KmqceD27" target="_blank">View Map</a>
                    </li>
                </ul>
            </div>
            
            <div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    Sushi & Yakiniku <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>Kitokito Sushi</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 25 min)</div>
                        <a href="https://maps.app.goo.gl/YQjLdV7eNGG9yF6E9" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Yakiniku Toyooka</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 22 min)</div>
                        <a href="https://maps.app.goo.gl/LxeKEXAFVqEAAJ4f9" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Echigoya</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 21 min)</div>
                        <a href="https://maps.app.goo.gl/3gspUgVzZQreVQ8Z7" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Yakiniku Otagiri</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 32 min)</div>
                        <a href="https://maps.app.goo.gl/u5Lh6yn9c2V2ErtZ8" target="_blank">View Map</a>
                    </li>
                </ul>
            </div>

            <div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    Chinese & Ramen <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>Eika (Machichuka)</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 11 min)</div>
                        <a href="https://maps.app.goo.gl/GKcWKjfZFrXxD9xP9" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Arakin Ramen</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 10 min)</div>
                        <a href="https://maps.app.goo.gl/royTk9WKLCv81MS49" target="_blank">View Map</a>
                    </li>
                </ul>
            </div>

            <div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    Izakaya <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>Tamaki</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 9 min)</div>
                        <a href="https://maps.app.goo.gl/QCEC39Y7BKbni2u9A" target="_blank">View Map</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>Nihontei</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(By car: 5 min)</div>
                        <a href="https://maps.app.goo.gl/AevwtYUQZE3ZgBXq6" target="_blank">View Map</a>
                    </li>
                </ul>
            </div>`,
                        jp: `<div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    和食 <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>一茶食堂</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩16分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=一茶食堂" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>信濃屋 そば</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で8分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=信濃屋そば" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>レストラン樹香</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で3分 / 徒歩29分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=レストラン樹香" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>そば処 たかさわ</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=そば処たかさわ" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>樹林とんかつ</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=樹林とんかつ" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>きらく園</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で15分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=きらく園" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                </ul>
            </div>

            <div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    寿司・焼肉 <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>きときと寿司</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で25分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=きときと寿司" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>精肉焼肉とよおか</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で22分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=精肉焼肉とよおか" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>越後屋</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で21分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=越後屋" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>焼肉おたぎり</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で32分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=焼肉おたぎり" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                </ul>
            </div>

            <div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    中華・ラーメン <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>栄華 町中華</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で11分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=栄華+町中華" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>あらきんラーメン</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で10分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=あらきんラーメン" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                </ul>
            </div>

            <div class="dining-accordion-group">
                <h4 class="guide-sub-title dining-accordion-header" style="cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="window.toggleDiningAccordion(this)">
                    居酒屋 <span class="accordion-icon">▶</span>
                </h4>
                <ul class="guide-list neighborhood-list two-col">
                    <li>
                        <strong>町酒場 たまき</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で9分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=町酒場+たまき" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                    <li style="display:none" class="hidden-item">
                        <strong>日本亭</strong>
                        <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で5分)</div>
                        <a href="https://www.google.com/maps/search/?api=1&query=日本亭" target="_blank" rel="noopener noreferrer">地図を見る</a>
                    </li>
                </ul>
            </div>`,
                    }
                },
                {
                    icon: "bath",
                    title: { en: "Onsen & Sauna", jp: "温泉・サウナ" },
                    content: {
                        en: `<ul class="guide-list neighborhood-list two-col">
                                                                            <li><strong>Madarao no Yu</strong> (Tattoo friendly)<br><a href="https://maps.app.goo.gl/YmcpSpDAjNMbH1ND9" target="_blank">View Map</a></li>
                                                                            <li><strong>THE SAUNA</strong><br><a href="https://maps.app.goo.gl/f2GPWJpnjmtHuHWQ8" target="_blank">View Map</a></li>
                                                                        </ul>`,
                        jp: `<ul class="guide-list neighborhood-list two-col">
                                                                            <li>
                                                                                <strong>まだらおの湯</strong> (タトゥーOK)
                                                                                <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で25分)</div>
                                                                                <a href="https://www.google.com/maps/search/?api=1&query=まだらおの湯" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                            </li>
                                                                            <li>
                                                                                <strong>THE SAUNA</strong>
                                                                                <div style="margin-bottom: 0.5rem; font-size: 0.9em;">(車で4分)</div>
                                                                                <a href="https://www.google.com/maps/search/?api=1&query=THE+SAUNA" target="_blank" rel="noopener noreferrer">地図を見る</a>
                                                                            </li>
                                                                        </ul>`
                    }
                },
                {
                    icon: "sightseeing",

                    title: { en: "Ski Resorts", jp: "スキー場" },
                    content: {
                        en: `<div class="resort-list">
                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Seki Onsen Ski Resort</strong> (20 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">Famous for heavy snow and powder. Advanced/Expert friendly with many non-groomed areas. Quiet and uncrowded.</p>
                                        <a href="https://maps.app.goo.gl/UvR1L72DBz7xh8ei9" target="_blank">View Map</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Myoko Kogen / Akakura Onsen</strong> (15 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">Wide variety of courses from beginner to advanced. Connected to Akakura Onsen town with great après-ski. Popular international resort.</p>
                                        <a href="https://maps.app.goo.gl/e4FE18NLo76F4yde6" target="_blank">View Map</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Kurohime Kogen Snow Park</strong> (10 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">Gentle slopes ideal for families and beginners. Excellent kids park and ski school. Uncrowded and relaxed.</p>
                                        <a href="https://maps.app.goo.gl/6Sjiz78maGxLj2aD6" target="_blank">View Map</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Tangram Ski Circus</strong> (14 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">All-in-one resort with hotel. Perfect for beginners and families. Offers activities beyond skiing.</p>
                                        <a href="https://maps.app.goo.gl/1oPx6GfS8E4DnXXZA" target="_blank">View Map</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Madarao Kogen Ski Resort</strong> (22 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">Known for the highest number of tree run courses in Japan. Popular for powder and backcountry lovers. Intermediate to Advanced.</p>
                                        <a href="https://maps.app.goo.gl/Bp4w27e8xNyrm1RV6" target="_blank">View Map</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Nozawa Onsen Ski Resort</strong> (45 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">Large scale resort with long runs. Historic onsen town atmosphere with free public baths. Great for sightseeing and skiing.</p>
                                        <a href="https://maps.app.goo.gl/zxcZVxCCdwNSAaXx6" target="_blank">View Map</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>Shiga Kogen Ski Resort</strong> (55 min drive)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">Japan's largest ski area (18 resorts). High altitude and stable snow quality. For advanced skiers and long stays.</p>
                                        <a href="https://maps.app.goo.gl/bDKF6hhpRqY1RVoJA" target="_blank">View Map</a>
                                    </div>
                                </details>
                            </div>`,
                        jp: `<div class="resort-list">
                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>関温泉スキー場</strong> (車で20分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">豪雪と上級者向けゲレンデで知られるローカルスキー場。非圧雪エリアが多く、パウダースノーを求める玄人スキーヤーに最適です。観光客が少なく、静かな環境で滑りたい方におすすめ。</p>
                                        <a href="https://maps.app.goo.gl/UvR1L72DBz7xh8ei9" target="_blank">地図を見る</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>妙高高原・赤倉温泉スキー場</strong> (車で15分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">初級から上級まで対応する豊富なコースバリエーションが魅力。ゲレンデ直結の赤倉温泉街があり、アフタースキーも充実しています。外国人観光客にも人気の国際的リゾートです。</p>
                                        <a href="https://maps.app.goo.gl/e4FE18NLo76F4yde6" target="_blank">地図を見る</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>黒姫高原スノーパーク</strong> (車で10分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">緩やかな斜面が多く、ファミリーや初心者に最適なスキー場。日本最大級のキッズパークやスキー教室が充実。混雑が少なく、のんびりと楽しめます。</p>
                                        <a href="https://maps.app.goo.gl/6Sjiz78maGxLj2aD6" target="_blank">地図を見る</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>タングラムスキーサーカス</strong> (車で14分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">ホテル併設のオールインワンリゾート。初心者コースやキッズエリアが充実しており、ファミリー層に人気。スノーアクティビティも豊富。</p>
                                        <a href="https://maps.app.goo.gl/1oPx6GfS8E4DnXXZA" target="_blank">地図を見る</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>斑尾高原スキー場</strong> (車で22分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">日本一のツリーランコース数を誇る、パウダー＆バックカントリー好きの聖地。地形を生かしたコースが多く、中級〜上級者も満足できます。</p>
                                        <a href="https://maps.app.goo.gl/Bp4w27e8xNyrm1RV6" target="_blank">地図を見る</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>野沢温泉スキー場</strong> (車で45分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">広大な敷地と長い滑走距離が魅力のビッグゲレンデ。歴史ある温泉街と一体化しており、スキー後の外湯巡りや観光も含めて楽しめます。</p>
                                        <a href="https://maps.app.goo.gl/zxcZVxCCdwNSAaXx6" target="_blank">地図を見る</a>
                                    </div>
                                </details>

                                <details class="living-accordion" name="ski-resort-group">
                                    <summary>
                                        <div><strong>志賀高原スキー場</strong> (車で55分)</div>
                                    </summary>
                                    <div class="accordion-body">
                                        <p class="resort-desc">日本最大級のスキーエリア（18のスキー場が集結）。標高が高く、雪質の良さと規模の大きさは圧倒的。長期滞在して全山制覇を目指す上級者にも。</p>
                                        <a href="https://maps.app.goo.gl/bDKF6hhpRqY1RVoJA" target="_blank">地図を見る</a>
                                    </div>
                                </details>
                            </div>`,
                    }
                }
            ]
        },
        {
            id: "rules",
            title: { en: "House Rules", jp: "ハウスルール" },
            items: [
                {
                    icon: "cancel",
                    title: { en: "Cancellation Policy", jp: "キャンセルポリシー" },
                    content: {
                        en: `<h4 class="guide-sub-title">Full Refund</h4>
                                                                        <p>Canceled 30+ days before check-in, OR canceled within 24 hours of booking (if booking made at least 7 days before check-in).</p>
                                                                        <h4 class="guide-sub-title">50% Refund</h4>
                                                                        <p>Canceled 30+ days before check-in but after the 24-hour grace period.</p>
                                                                        <h4 class="guide-sub-title">Full Refund</h4>
                                                                        <p>Canceled less than 30 days before check-in, IF booking was made at least 7 days before check-in and canceled within 24 hours.</p>
                                                                        <h4 class="guide-sub-title">No Refund (Tax Only)</h4>
                                                                        <p>Canceled less than 30 days before check-in and after the 24-hour grace period.</p>`,
                        jp: `<h4 class="guide-sub-title">全額返金</h4>
                                                                        <p>チェックイン30日前までのキャンセル、またはチェックイン7日前までの予約で予約確定後24時間以内のキャンセル。</p>
                                                                        <h4 class="guide-sub-title">50%返金</h4>
                                                                        <p>チェックイン30日前までのキャンセルで、予約確定後24時間を過ぎた場合。</p>
                                                                        <h4 class="guide-sub-title">全額返金</h4>
                                                                        <p>チェックイン30日を切ってからのキャンセルだが、チェックイン7日前までの予約で予約確定後24時間以内のキャンセル。</p>
                                                                        <h4 class="guide-sub-title">返金なし（税金のみ）</h4>
                                                                        <p>チェックイン30日を切ってからのキャンセルで、予約確定後24時間を過ぎている場合。</p>`
                    }
                },
                {
                    icon: "rules",
                    title: { en: "General Rules", jp: "ルール" },
                    content: {
                        en: `<h4 class="guide-sub-title">Noise</h4>
                                                                        <p>Please refrain from loud noise, music, or partying that bothers neighbors. Loitering around the entrance is prohibited. Use may be terminated if complaints adhere.</p>
                                                                        <h4 class="guide-sub-title">Smoking</h4>
                                                                        <p><strong>Strictly No Smoking Indoors.</strong> Smoking is allowed on the terrace only. No ashtrays provided. A fine will be charged if indoor smoking is discovered.</p>
                                                                        <h4 class="guide-sub-title">Damages</h4>
                                                                        <p>Please report any damage or stains immediately, whether intentional or accidental. Charges may apply based on terms.</p>
                                                                        <h4 class="guide-sub-title">Other</h4>
                                                                        <p>Violations of terms may result in termination of stay. Package delivery/receipt before or after reservation hours is not allowed (unless approved).</p>`,
                        jp: `<h4 class="guide-sub-title">騒音について</h4>
                                                                        <p>大声で騒ぐ・音楽を大音量で流すなど近隣のご迷惑になる行為はご遠慮ください。入口周辺でのたむろ行為は周辺住民のご迷惑となります。近隣から指摘があった場合、利用を中止いただくことがあります。</p>
                                                                        <h4 class="guide-sub-title">喫煙</h4>
                                                                        <p>建物内は禁煙となります。喫煙をされる場合は、テラスでお願いします。灰皿の用意はありません。喫煙が発覚した場合、罰金を課させていただきます。</p>
                                                                        <h4 class="guide-sub-title">破損・汚損があった際の対応</h4>
                                                                        <p>備品や設備を破損汚損された場合、故意または過失を問わず必ずご連絡をお願いします。利用規約に基づきご請求をさせていただく場合があります。</p>
                                                                        <h4 class="guide-sub-title">その他</h4>
                                                                        <p>利用規約に反したご利用が確認された場合は、利用中止をさせていただくことがあります。予約時間前後に荷物を受取、配達をすることはできません。</p>`
                    }
                },
                {
                    icon: "cancel",
                    title: { en: "Prohibited Acts", jp: "禁止行為" },
                    content: {
                        en: `<p><strong>Unauthorized Extension:</strong> Please adhere to check -in /out times. ¥10,000 per 30 min charged for unauthorized extensions.</p>
                                                                        <p><strong>Fire:</strong> Use of fire indoors is prohibited (except kitchen stove).</p>
                                                                        <p><strong>Restricted Areas:</strong> Guests are not allowed on the 3rd floor.</p>
                                                                        <img data-img="no_entry_3rd_floor_gate.jpg" alt="3rd Floor Gate" loading="lazy" style="width: 100%; max-width: 100%; display: block; margin: 1rem auto; border-radius: 6px;">`,
                        jp: `<p><strong>無断延長:</strong> 予約時間内の入退室をお願いします。無断延長は30分につき1万円を請求します。</p>
                                                                        <p><strong>火気の利用:</strong> 室内での火気利用は禁止です（キッチンコンロを除く）。</p>
                                                                        <p><strong>立入禁止:</strong> 3階は管理上の理由により立ち入りできません。</p>
                                                                        <img data-img="no_entry_3rd_floor_gate.jpg" alt="3階ゲート" loading="lazy" style="width: 100%; max-width: 100%; display: block; margin: 1rem auto; border-radius: 6px;">`
                    }
                },
                {
                    icon: "info",
                    title: { en: "Important Notes", jp: "注意事項" },
                    content: {
                        en: `<ul class="guide-list">
                                                                            <li>① Do not take amenities home. You may be charged for unauthorized removal.</li>
                                                                            <li>② Do not enter with shoes on.</li>
                                                                            <li>③ Be mindful of noise when windows or the entrance are open.</li>
                                                                            <li>④ There are no security cameras. Please manage your own valuables.</li>
                                                                        </ul>`,
                        jp: `<ul class="guide-list">
                                                                            <li>① 備品は持ち帰らないでください。無断持ち出しは請求対象となる場合があります。</li>
                                                                            <li>② 靴で室内には入らないでください。</li>
                                                                            <li>③ 窓、玄関を開放しての騒音はご注意ください。</li>
                                                                            <li>④ 防犯カメラは設置しておりません。貴重品の管理はご利用者様で行ってください。</li>
                                                                        </ul>`,
                    }
                },
                {
                    icon: "money",
                    title: { en: "Pricing", jp: "料金体系" },
                    content: {
                        en: `<p><strong>Capacity:</strong> Up to 8 guests(Adults + Children).</p>
                                                                        <p><strong>Extra Guest Fee:</strong> ¥5,000 per person for 4+ guests.</p>
                                                                        <p><strong>Infants:</strong> Counted as 1 guest from age 0.</p>`,
                        jp: `<p><strong>定員:</strong> 大人・子供合わせて8名まで。</p>
                                                                        <p><strong>追加料金:</strong> 4名以上は一人当たり5,000円がかかります。</p>
                                                                        <p><strong>乳幼児:</strong> 0歳児から1名とカウントさせていただきます。</p>`
                    }
                },
                {
                    icon: "check",
                    title: { en: "Checkout Checklist", jp: "退出時チェックリスト" },
                    content: {
                        en: `<ul class="guide-list">
                                                                            <li>① Return furniture/items to original layout.</li>
                                                                            <li>② Separate trash (see guidelines).</li>
                                                                            <li>③ Empty fridge (take all food home).</li>
                                                                            <li>④ Turn off AC and lights.</li>
                                                                            <li>⑤ Check for personal belongings (cables, fridge, clothes).</li>
                                                                            <li>⑥ Report any lost or broken items.</li>
                                                                        </ul>`,
                        jp: `<ul class="guide-list">
                                                                            <li>① 机や椅子、小物を動かされた場合は、元のレイアウトに戻してください</li>
                                                                            <li>② 残った食材は冷蔵庫に残さず、全てお持ち帰りください</li>
                                                                            <li>③ エアコン、電気等の電源をオフにしてください</li>
                                                                            <li>④ 忘れ物はありませんか?(充電ケーブル/冷蔵庫内/傘/洋服 等)</li>
                                                                            <li>⑤ 備品の紛失、破損等があった場合はご連絡をお願い致します</li>
                                                                            <li>⑥ ゴミは分別して画像のようにリビングルームに置いてください<br>
                                                                                <img data-img="trashbox.png" alt="ゴミ箱" loading="lazy" style="width: 100%; max-width: 600px; display: block; margin: 16px auto 0; border-radius: 12px; height: auto;">
                                                                            </li>
                                                                        </ul>`,
                    }
                },
                {
                    icon: "phone",
                    title: { en: "Emergency Contact", jp: "緊急連絡先" },
                    content: {
                        en: `<p><strong>Manager (Kobayashi):</strong> 090 - 9357 - 5586</p>`,
                        jp: `<p><strong>管理者 (小林):</strong> 090 - 9357 - 5586</p>`,
                    }
                }
            ]
        },
        {
            id: "faq",
            title: { en: "FAQ", jp: "よくある質問" },
            items: [
                {
                    icon: "rooms",
                    title: { en: "Change Guest Count", jp: "宿泊人数変更したいです" },
                    content: {
                        en: `<p><strong>OTA Bookings:</strong> Please contact the OTA(Booking.com, Airbnb, etc.) directly.</p>
    <p><strong>Official Site Bookings:</strong> Please contact us via chat or the email you used for booking.</p>`,
                        jp: `<p><strong>OTAからご予約の場合:</strong> 各OTAにお問い合わせください。</p>
    <p><strong>公式サイトからのご予約の場合:</strong> チャットまたはご予約いただいたメールアドレスからお問い合わせください。</p>`
                    }
                },

                {
                    icon: "power",
                    title: { en: "Breaker Tripped", jp: "ブレーカー落ちた時どうすればいいでしょうか" },
                    content: {
                        en: `<p>If the power goes out, a breaker may have tripped.Please follow these steps to restore power:</p>
                                                                        <p>1. Find the tripped breaker (near the entrance) and push it all the way DOWN.</p>
                                                                        <details class="living-accordion" style="margin-bottom: 1rem;">
                                                                            <summary>View Image</summary>
                                                                            <img data-img="breaker_step_2.jpg" alt="Step 1: Push Down" class="living-image" loading="lazy" style="width: 60%; display: block; margin: 1rem auto 0;">
                                                                        </details>
                                                                            <p>2. Then push it all the way UP to "ON".<br>👉 It should click into place.</p>
                                                                            <details class="living-accordion">
                                                                                <summary>View Image</summary>
                                                                                <img data-img="breaker_step_1.jpg" alt="Step 2: Push Up" class="living-image" loading="lazy" style="width: 60%; display: block; margin: 1rem auto 0;">
                                                                            </details>`,
                        jp: `<p>電気が突然使えなくなった場合、ブレーカーが落ちている可能性があります。<br>以下の手順で復旧してください。</p>
                                                                                <p>① 玄関付近にあるブレーカーのうち、落ちているものを一度いちばん下まで下げてください。</p>
                                                                                <details class="living-accordion" style="margin-bottom: 1rem;">
                                                                                    <summary>画像を表示</summary>
                                                                                    <img data-img="breaker_step_2.jpg" alt="手順1: ブレーカーを下げる" class="living-image" loading="lazy" style="width: 60%; display: block; margin: 1rem auto 0;">
                                                                                </details>
                                                                                    <p>② その後、しっかり上まで上げて「ON」にしてください。<br>👉 カチッと音がすればOKです。</p>
                                                                                    <details class="living-accordion">
                                                                                        <summary>画像を表示</summary>
                                                                                        <img data-img="breaker_step_1.jpg" alt="手順2: ブレーカーを上げる" class="living-image" loading="lazy" style="width: 60%; display: block; margin: 1rem auto 0;">
                                                                                    </details>`
                    }
                },
                {
                    icon: "receipt",
                    title: { en: "Issue Receipt", jp: "領収書発行したい場合どうすればいいでしょうか" },
                    content: {
                        en: `<p><strong>OTA Bookings:</strong> Please issue the receipt through the OTA platform.</p>
                                                                                        <p><strong>Official Site Bookings:</strong> Please contact us via chat or email.</p>`,
                        jp: `<p><strong>OTAからご予約の場合:</strong> 各OTAにお問い合わせください。</p>
                                                                                        <p><strong>公式サイトからのご予約の場合:</strong> チャットまたはご予約いただいたメールアドレスからお問い合わせください。</p>`
                    }
                },
                {
                    icon: "luggage",
                    title: { en: "Luggage Delivery", jp: "事前・事後に荷物を配送したい場合" },
                    content: {
                        en: `<p><strong>Pre-delivery:</strong> Accepted if arriving <strong>after 12:00 PM</strong> on check-in day.</p>
                                                                                        <p><strong>Delivery Method:</strong> Packages will be left at the entrance (unlocked area) as this is a self-check-in facility.</p>
                                                                                        <div class="warning-box">
                                                                                            <strong>Warning:</strong> We are not responsible for any loss of items. Please do NOT ship valuables.
                                                                                        </div>
                                                                                        <p><strong>Address:</strong> 54-3 Nojiri, Shinano-machi, Kamiminochi-gun, Nagano-ken</p>
                                                                                        <p><strong>Recipient:</strong> Please write your Check-in Date and Reservation Name.</p>`,
                        jp: `<p><strong>事前配送:</strong> ご宿泊日の<strong>当日12時以降</strong>の到着指定であれば可能です。</p>
                                                                                        <p><strong>受取方法:</strong> 無人営業のため、お受け取りはできません。置き配（玄関・施錠なし）となります。</p>
                                                                                        <div class="warning-box">
                                                                                            <strong>注意:</strong> 紛失の責任は負いかねます。貴重品類の配送はお控えくださいませ。
                                                                                        </div>
                                                                                        <p><strong>送付先:</strong> 長野県上水内郡信濃町野尻54-3</p>
                                                                                        <p><strong>宛名:</strong> 宿泊日/ご予約名の記載をお願いいたします。</p>`
                    }
                },
                {
                    icon: "help",
                    title: { en: "Lost Items", jp: "忘れ物をした場合" },
                    content: {
                        en: `<p>For privacy reasons, we do not contact guests regarding lost items.</p>
                                                                                        <p>If you realize you left something behind, please contact us via your booking platform message or phone.</p>`,
                        jp: `<p>プライバシーの観点から、施設側から忘れ物のご連絡はいたしません。</p>
                                                                                        <p>お気づきの際は、ご予約いただいたOTAのメッセージまたは電話等でご連絡ください。</p>`
                    }
                },
                {
                    icon: "clock",
                    title: { en: "Early Check-in / Late Check-out", jp: "アーリーチェックインとレートチェックアウト" },
                    content: {
                        en: `<p>Available depending on reservation schedules.</p>
                                                                                        <p><strong>Fee:</strong> ¥8,000 per hour (includes cleaning fee adjustment).</p>
                                                                                        <p>Please contact us in advance to check availability.</p>`,
                        jp: `<p>前後の予約状況によりますが、早くチェックインまたは遅くチェックアウトしたい場合は、清掃費を含めて、1時間ごとに追加で8,000円をいただいております。</p>`
                    }
                }
            ]
        }
    ],
    services: [
        {
            id: 1,
            name: { en: "Jacuzzi", jp: "ジャグジー" },
            price: 10000,
            description: {
                en: "Excellent jacuzzi with lake view. *Available Mar-Nov only",
                jp: "湖を見ながら入るジャグジーは格別です。※3月~11月のみ利用可能"
            },
            image: "jacuzzi.jpg",
            icon: "bath",
            modalDetails: {
                title: { en: "Jacuzzi (Paid)", jp: "ジャグジー（有料）" },
                overview: {
                    en: "<strong style='font-size: 1.2em;'>Private Jacuzzi with Panoramic Lake Views</strong>\nAn open-air bath located on the deck. Enjoy a luxurious time with evening illumination, surrounded by the peaceful lakeside atmosphere.",
                    jp: "<strong style='font-size: 1.2em;'>湖一望の絶景プライベートジャグジー</strong>\nデッキに設置された開放的なアウトドアバス。夕暮れ時はライトアップされ、静かな湖畔の空気と共に贅沢なひとときをお楽しみいただけます。"
                },
                priceLabel: { en: "Price", jp: "料金" },
                priceValue: "¥10,000",
                periodLabel: { en: "Available Period", jp: "利用可能期間" },
                periodValue: {
                    en: "March - November only\n*Subject to change depending on temperature and snow conditions.",
                    jp: "3月〜11月のみ\n※気温や積雪状況などの影響により、利用開始・終了時期が前後する場合がございます。"
                },
                includesLabel: { en: "Includes", jp: "含まれるもの" },
                includesValue: {
                    en: "Please use the towels provided in the room.",
                    jp: "タオルは室内のものをご利用ください。"
                },
                flowLabel: { en: "How to Use", jp: "ご利用の流れ" },
                flowValue: {
                    en: "① Reserve\n② Staff prepares on the day\n③ Enjoy",
                    jp: "① 予約する\n② 当日スタッフが準備\n③ ご利用"
                },
                notesLabel: { en: "Notes", jp: "注意事項" },
                notesValue: {
                    en: "・Please be considerate of neighbors at night\n・Close the lid when leaving",
                    jp: "・夜間は近隣へのご配慮をお願いいたします\n・退出時はフタを閉めてください"
                }
            }
        }
    ]
};

// ============================================
// LANGUAGE HELPERS
// ============================================
function getLang() {
    return window.currentLang || 'en';
}

function getLocalizedText(obj) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    const lang = getLang();
    return obj[lang] || obj.en || obj.jp || '';
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    resolveImagePaths();
    renderGuidebook();
    resolveImagePaths();
    initNavigation();

    // Implement toggleLanguage and updateContent since app.js is not loaded
    window.updateContent = () => {
        const lang = getLang();
        const t = window.getI18n
            ? { get: (k) => window.getI18n(k, lang) }
            : { get: (k) => (window.translations?.[lang]?.[k] ?? '') };
        const getT = (k) => (window.getI18n ? window.getI18n(k, lang) : (window.translations?.[lang]?.[k] ?? ''));

        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = getT(key);

            if (translation !== undefined) {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    if (element.getAttribute('placeholder')) {
                        element.placeholder = translation;
                    } else {
                        element.value = translation;
                    }
                } else if (element.tagName === 'IMG') {
                    element.alt = translation;
                } else {
                    // Check for HTML content in specific keys if needed, otherwise textContent
                    if (key.includes('headline') || key.includes('desc')) {
                        element.innerHTML = translation;
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
    };

    window.toggleLanguage = (targetLang) => {
        if (targetLang) {
            window.currentLang = targetLang;
        } else {
            window.currentLang = window.currentLang === 'en' ? 'jp' : 'en';
        }
        localStorage.setItem('siteLang', window.currentLang);

        // Toggle body class
        if (document.body) {
            document.body.classList.remove('lang-en', 'lang-jp');
            document.body.classList.add(`lang-${window.currentLang}`);
        }

        // Update all content
        window.updateContent();

        // Re-render guidebook content
        renderGuidebook();
        resolveImagePaths();
        updateLanguageLabel();
    };

    // Initial label update and content translation
    window.updateContent();
    updateLanguageLabel();

    // Initialize New Navigation
    renderTopNav();
    // Initialize New Navigation
    renderTopNav();
    switchCategory('greeting'); // Default to greeting
});

const categories = [
    { id: 'greeting', title: { en: 'Welcome', jp: '挨拶' }, icon: 'info' },
    { id: 'access', title: { en: 'Access & WiFi', jp: 'アクセス ＆ WiFi' }, icon: 'address' },
    { id: 'services', title: { en: 'Optional Services', jp: '有料サービス' }, icon: 'amenities' },
    { id: 'facility', title: { en: 'Room & Equipment Guide', jp: '各部屋と備品のご案内' }, icon: 'rooms' },
    { id: 'neighborhood', title: { en: 'Neighborhood', jp: '周辺情報' }, icon: 'sightseeing' },
    { id: 'rules', title: { en: 'House Rules', jp: 'ハウスルール' }, icon: 'cancel' },
    { id: 'faq', title: { en: 'FAQ', jp: 'よくある質問' }, icon: 'receipt' }
];

let activeCategory = 'greeting';

function renderGuidebook() {
    renderPropertyInfo();
    renderSections();
    renderServices();
    createServiceModal();

    // Re-render nav if active (e.g. language switch)
    renderTopNav();
    renderSidebar(activeCategory);

    initAccordions();
    initSearch();
    if (window.updateContent) window.updateContent();

    // Re-apply visibility rules for the active category (preserving scroll)
    switchCategory(activeCategory, true);
}

// Render Top Horizontal Navigation
function renderTopNav() {
    const container = document.getElementById('top-nav-container');
    if (!container) return;

    container.innerHTML = `<nav class="top-nav-scroll">
                                                                                            ${categories.map(cat => `
            <button class="top-nav-item ${cat.id === activeCategory ? 'active' : ''}" 
                    onclick="switchCategory('${cat.id}')">
                ${ICONS[cat.icon] || ''} ${getLocalizedText(cat.title)}
            </button>
        `).join('')}
                                                                                        </nav>`;
}

// Switch Category (Tabbed View Logic)
window.switchCategory = function (catId, preserveScroll = false) {
    activeCategory = catId;

    // 1. Update Top Nav Active State
    renderTopNav(); // Simple re-render to update active class

    // 2. Show/Hide Sections (Tab behavior)
    // Hide all main containers first
    const layout = document.querySelector('.guidebook-layout');
    const hero = document.querySelector('.guidebook-hero');
    const isGreeting = (catId === 'greeting');

    if (hero) hero.style.display = isGreeting ? 'block' : 'none'; // Only show hero on Greeting tab
    if (layout) {
        if (isGreeting) {
            layout.classList.add('has-hero');
        } else {
            layout.classList.remove('has-hero');
        }
    }

    // Reset scroll position to top when switching categories manually
    // If preserveScroll is true (e.g. used by navigateToItem), we skip this
    if (!preserveScroll) {
        window.scrollTo({ top: 0, behavior: 'auto' }); // Instant jump preferred for tab switch, or smooth
    }

    // Info components
    const propertyInfo = document.getElementById('property-info'); // Note: property-info ID might not exist in HTML yet, relying on Hero mainly for 'info'

    // Access
    const access = document.getElementById('access');
    if (access) access.style.display = (catId === 'access') ? 'block' : 'none';

    // Greeting (new section logic if it has its own container, or dynamic like others)
    // Assuming greeting is rendered dynamically as 'section-greeting' like others
    // But since we added it to `guidebookData.sections`, it will be handled by dynamic loop below as `section-greeting`.
    // Wait, dynamic sections loop hides ALL first. So section-greeting will be hidden there.
    // We just need to ensure section-greeting is SHOWN.

    // Services
    const services = document.getElementById('services');
    if (services) services.style.display = (catId === 'services') ? 'block' : 'none';

    // Dynamic Sections
    document.querySelectorAll('.guidebook-section.dynamic-section').forEach(sec => {
        sec.style.display = 'none';
    });

    // Show target dynamic section
    const targetSection = document.getElementById(`section-${catId}`);
    if (targetSection) targetSection.style.display = 'block';

    // 3. Update Sidebar (Sub-navigation)
    renderSidebar(catId);

    // 4. Scroll active nav item into view (Center it)
    if (!preserveScroll) {
        scrollActiveNavIntoView();

        // 5. Scroll to top
        window.scrollTo(0, 0);
    }
}

function scrollActiveNavIntoView() {
    const container = document.querySelector('.top-nav-scroll');
    const activeItem = container ? container.querySelector('.top-nav-item.active') : null;

    if (activeItem) {
        // Use modern scrollIntoView with inline: 'center' to handle horizontal centering
        activeItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
}

// Render Sidebar (Sub-items of the active category)
function renderSidebar(catId) {
    const sidebarList = document.querySelector('.sidebar-nav');
    if (!sidebarList) return;

    let html = '';

    if (catId === 'access' && guidebookData.access && guidebookData.access.items) {
        guidebookData.access.items.forEach((item, index) => {
            const itemTitle = getLocalizedText(item.title);
            const icon = ICONS[item.icon] || '';
            html += `
                <a href="#" class="sidebar-subitem" onclick="scrollToId('item-access-${index}', event)">
                    ${icon} ${itemTitle}
                </a>
            `;
        });
    } else if (catId === 'services') {
        guidebookData.services.forEach(service => {
            const icon = ICONS[service.icon] || ICONS.amenities || '';
            html += `
                <a href="#" class="sidebar-subitem" onclick="scrollToId('service-${service.id}', event)">
                    ${icon} ${getLocalizedText(service.name)}
                </a>
            `;
        });
    } else {
        // For Facilities, Rules, FAQ etc.
        const section = guidebookData.sections.find(s => s.id === catId);
        if (section && section.items) {
            section.items.forEach((item, index) => {
                const icon = ICONS[item.icon] || '';
                html += `
                    <button class="sidebar-subitem" style="background:none; border:none; width:100%; text-align:left; cursor:pointer;" onclick="scrollToId('item-${catId}-${index}', event)">
                        ${icon} ${getLocalizedText(item.title)}
                    </button>
                `;
            });
        }
    }

    sidebarList.innerHTML = html;
}

// Helper for offsets (Header + TopNav + Buffer)
const SCROLL_OFFSET_MOBILE = 150;
const SCROLL_OFFSET_DESKTOP = 160;

function getScrollOffset() {
    if (window.innerWidth <= 768) return 180;

    // Dynamically measure header and nav heights for accuracy
    const header = document.querySelector('.guidebook-header');
    const topNav = document.querySelector('.top-nav-container');

    let totalOffset = 0;
    if (header) totalOffset += header.offsetHeight;
    if (topNav) totalOffset += topNav.offsetHeight;

    // Add a comfortable buffer (20px)
    return totalOffset + 20;
}

// Helper for smooth scrolling within the tab
window.scrollToId = function (id, event) {
    if (event) event.preventDefault();

    // Close sidebar if open (mobile)
    const sidebar = document.getElementById('guidebook-sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        document.getElementById('sidebar-toggle')?.classList.remove('active');
        document.querySelector('.sidebar-overlay')?.classList.remove('visible');
    }

    setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
            // Force manual calculation to guarantee offset
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - getScrollOffset();

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Also open accordion if it is one
            if (el.classList.contains('accordion-item')) {
                el.classList.add('open');
            }
        }
    }, 300);
}

window.scrollToElement = function (id) {
    const el = document.getElementById(id);
    if (el) {
        const elementPosition = el.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - getScrollOffset();

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderPropertyInfo() {
    const propertyNameEl = document.getElementById('property-name');
    const heroImage = document.querySelector('.hero-image');
    const welcomeMessageEl = document.getElementById('welcome-message');

    if (propertyNameEl) {
        propertyNameEl.textContent = guidebookData.propertyName;
    }
    if (heroImage && guidebookData.heroImage) {
        heroImage.src = IMG_BASE + guidebookData.heroImage;
    }
    if (welcomeMessageEl && guidebookData.welcomeMessage) {
        welcomeMessageEl.textContent = getLocalizedText(guidebookData.welcomeMessage);
    }
}

function renderSections() {
    const container = document.getElementById('sections-container');
    if (!container) return;

    let html = '';
    const lang = getLang();
    const t = window.I18N ? { get: (k) => window.getI18n(k, lang) } : {};
    const getT = (k) => window.getI18n ? window.getI18n(k, lang) : (window.translations?.[lang]?.[k] ?? '');

    // Render Access section first (now as expanded cards)
    if (guidebookData.access && guidebookData.access.items) {
        const accessTitle = getLocalizedText(guidebookData.access.title);
        html += `
                                                                                        <section class="guidebook-section" id="access">
                                                                                            <h2 class="section-title">${accessTitle}</h2>
                                                                                            <div class="content-cards">
                                                                                                ${guidebookData.access.items.map((item, index) => {
            const itemTitle = getLocalizedText(item.title) || item.title;
            const itemContent = getLocalizedText(item.content) || item.content;
            const iconHtml = item.icon && ICONS[item.icon] ? ICONS[item.icon] : '';
            return `
                            <div class="content-card" id="item-access-${index}">
                                <h3 class="card-header">${iconHtml} ${itemTitle}</h3>
                                <div class="card-body">
                                    ${itemContent}
                                </div>
                            </div>
                        `;
        }).join('')}
                                                                                            </div>
                                                                                        </section>
                                                                                        `;
    }

    // Render expanded card sections
    guidebookData.sections.forEach(section => {
        const sectionTitle = getLocalizedText(section.title) || section.title;
        html += `
                                                                                        <section class="guidebook-section dynamic-section" id="section-${section.id}">
                                                                                            <h2 class="section-title">${sectionTitle}</h2>
                                                                                            <div class="content-cards">
                                                                                                ${section.items.map((item, index) => {
            const itemTitle = getLocalizedText(item.title) || item.title;
            const itemContent = getLocalizedText(item.content) || item.content;
            const iconHtml = item.icon && ICONS[item.icon] ? ICONS[item.icon] : '';

            // Check if this is a Dining section header
            const isDiningHeader = itemTitle.startsWith("Dining") || itemTitle.includes("食事");
            const headerClass = isDiningHeader ? "card-header gold-underline dining-header" : "card-header";

            if (item.collapsible) {
                return `
                            <details class="content-card living-accordion" id="item-${section.id}-${index}" open>
                                <summary class="${headerClass}" style="justify-content: space-between;">${iconHtml} ${itemTitle}</summary>
                                <div class="card-body">
                                    ${itemContent}
                                </div>
                            </details>
                        `;
            } else {
                return `
                            <div class="content-card" id="item-${section.id}-${index}">
                                <h3 class="${headerClass}">${iconHtml} ${itemTitle}</h3>
                                <div class="card-body">
                                    ${itemContent}
                                </div>
                            </div>
                        `;
            }
        }).join('')}
                                                                                            </div>
                                                                                        </section>
                                                                                        `;
    });

    container.innerHTML = html;
}

function renderServices() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    const lang = getLang();
    const t = window.I18N ? { get: (k) => window.getI18n(k, lang) } : {};
    const getT = (k) => window.getI18n ? window.getI18n(k, lang) : (window.translations?.[lang]?.[k] ?? '');
    const reserveText = getT('guidebook.services.reserve') || 'Reserve';

    const html = guidebookData.services.map(service => {
        const serviceName = getLocalizedText(service.name);
        const serviceDesc = getLocalizedText(service.description);
        return `
            <div class="service-card" style="cursor: pointer;" onclick="openServiceModal(${service.id})">
                <img data-img="${service.image}" alt="${serviceName}" class="service-image" loading="lazy">
                <div class="service-info">
                    <h3 class="service-name">${serviceName}</h3>
                    <p class="service-desc">${serviceDesc}</p>
                    <p class="service-price">¥${service.price.toLocaleString()}</p>
                    <button class="service-btn" onclick="event.stopPropagation(); handleServiceClick(${service.id})">${reserveText}</button>
                </div>
            </div>
        `;
    }).join('');

    grid.innerHTML = html;
}

// ============================================
// ACCORDION FUNCTIONALITY
// ============================================

function initAccordions() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isOpen = item.classList.contains('open');

            // Close all items in the same accordion (optional - remove for multi-open)
            // const accordion = item.parentElement;
            // accordion.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));

            // Toggle current item
            if (isOpen) {
                item.classList.remove('open');
            } else {
                item.classList.add('open');
            }
        });
    });
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
    // Keep sidebar toggle logic for mobile
    const sidebar = document.getElementById('guidebook-sidebar');
    const toggle = document.getElementById('sidebar-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            toggle.classList.toggle('active');
            if (overlay) overlay.classList.toggle('visible');
        });

        if (overlay) {
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                toggle.classList.remove('active');
                overlay.classList.remove('visible');
            });
        }
    }
}

// ============================================
// SEARCH FUNCTIONALITY
// ============================================

// Global search index to prevent stale closures
let searchIndex = [];

function initSearch() {
    const searchInput = document.getElementById('guidebook-search');
    const searchResults = document.getElementById('search-results');

    if (!searchInput || !searchResults) return;

    // Build initial index
    updateSearchIndex();

    // Prevent duplicate listeners
    if (searchInput.dataset.searchInitialized) {
        // Update placeholder only
        updateSearchPlaceholder(searchInput);
        return;
    }

    // Debounce function
    let debounceTimer;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                searchResults.classList.remove('active');
                searchResults.innerHTML = '';
                return;
            }

            // Use the global searchIndex which is updated on language toggle
            const results = performSearch(query, searchIndex);
            renderSearchResults(results, query, searchResults);
        }, 200);
    });

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.header-search')) {
            searchResults.classList.remove('active');
        }
    });

    // Mark as initialized
    searchInput.dataset.searchInitialized = 'true';

    // Update placeholder based on language
    updateSearchPlaceholder(searchInput);
}

function updateSearchPlaceholder(searchInput) {
    const lang = getLang();
    searchInput.placeholder = lang === 'jp' ? 'ガイドブックを検索...' : 'Search guidebook...';
}

function updateSearchIndex() {
    // Clear and rebuild
    searchIndex = [];

    // Add Access items
    if (guidebookData.access && guidebookData.access.items) {
        guidebookData.access.items.forEach((item, idx) => {
            const title = getLocalizedText(item.title);
            const content = stripHtml(getLocalizedText(item.content));
            searchIndex.push({
                id: `item-access-${idx}`,
                sectionId: 'access',
                title: title,
                content: content,
                category: getLocalizedText(guidebookData.access.title)
            });
        });
    }

    // Add other sections
    guidebookData.sections.forEach(section => {
        section.items.forEach((item, idx) => {
            const title = getLocalizedText(item.title);
            const content = stripHtml(getLocalizedText(item.content));
            searchIndex.push({
                id: `item-${section.id}-${idx}`,
                sectionId: section.id,
                title: title,
                content: content,
                category: getLocalizedText(section.title)
            });
        });
    });
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function performSearch(query, index) {
    const lowerQuery = query.toLowerCase();
    const results = [];

    index.forEach(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerQuery);
        const contentMatch = item.content.toLowerCase().includes(lowerQuery);

        if (titleMatch || contentMatch) {
            // Find matched context
            let context = '';
            let matchLocation = 'title';

            if (contentMatch) {
                matchLocation = 'content';
                const lowerContent = item.content.toLowerCase();
                const matchIndex = lowerContent.indexOf(lowerQuery);
                const start = Math.max(0, matchIndex - 30);
                const end = Math.min(item.content.length, matchIndex + query.length + 50);
                context = (start > 0 ? '...' : '') +
                    item.content.substring(start, end) +
                    (end < item.content.length ? '...' : '');
            }

            results.push({
                ...item,
                matchLocation,
                context,
                score: titleMatch ? 2 : 1 // Title matches score higher
            });
        }
    });

    // Sort by score (title matches first)
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, 8); // Limit to 8 results
}

function renderSearchResults(results, query, container) {
    if (results.length === 0) {
        const lang = getLang();
        const noResultsText = lang === 'jp' ? '結果が見つかりません' : 'No results found';
        container.innerHTML = `<div class="search-no-results">${noResultsText}</div>`;
        container.classList.add('active');
        return;
    }

    const html = results.map(result => {
        const highlightedTitle = highlightMatch(result.title, query);
        const highlightedContext = result.context ? highlightMatch(result.context, query) : '';

        return `
                                                                                        <div class="search-result-item" onclick="navigateToSearchResult('${result.sectionId}', '${result.id}')">
                                                                                            <div class="search-result-title">${highlightedTitle}</div>
                                                                                            ${highlightedContext ? `<div class="search-result-context">${highlightedContext}</div>` : ''}
                                                                                        </div>
                                                                                        `;
    }).join('');

    container.innerHTML = html;
    container.classList.add('active');
}

function highlightMatch(text, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${ }()|[\]\\]/g, '\\$&');
}

window.navigateToSearchResult = function (sectionId, itemId) {
    // Close search results
    const searchResults = document.getElementById('search-results');
    const searchInput = document.getElementById('guidebook-search');
    if (searchResults) searchResults.classList.remove('active');
    if (searchInput) searchInput.value = '';

    // Switch to the correct category/section
    if (sectionId === 'access') {
        switchCategory('access');
    } else {
        // Find which top-nav category this section belongs to
        const section = guidebookData.sections.find(s => s.id === sectionId);
        if (section) {
            switchCategory(section.id);
        }
    }

    // Since we are navigating to a specific item, we expect scrollIntoView to handle it.
    // However, switchCategory will now reset scroll to top. 
    // We need to ensure scrollIntoView runs AFTER that reset completes.

    // Scroll to the specific item after a short delay (allow DOM to update)
    setTimeout(() => {
        const element = document.getElementById(itemId);
        if (element) {
            // Use manual offset calculation instead of scrollIntoView
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - getScrollOffset();

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });

            // Add a brief highlight effect
            element.style.boxShadow = '0 0 0 2px var(--gb-accent)';
            setTimeout(() => {
                element.style.boxShadow = '';
            }, 2000);
        }
    }, 100);
};

// ============================================
// SERVICE HANDLERS
// ============================================

async function handleServiceClick(serviceId) {
    const service = guidebookData.services.find(s => s.id === serviceId);
    if (!service) return;

    // priceが設定されていればStripeで決済可能にする
    if (service.price && service.price > 0) {
        try {
            const currentUrl = window.location.href;
            const successUrl = `${window.location.origin}/g/option-success.html?return_url=${encodeURIComponent(window.location.pathname)}`;

            // URLパラメータ ?booking= からBeds24のbookingIDを取得（メッセージ送信に使用）
            const urlParams = new URLSearchParams(window.location.search);
            const beds24BookingId = urlParams.get('booking') || '';
            
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productName: `${guidebookData.propertyName} - ${service.name.en || service.name}`,
                    amount: service.price,
                    currency: "jpy",
                    metadata: {
                        property: guidebookData.propertyId,
                        option: service.id.toString(),
                        option_name: service.name.en || service.name,
                        beds24_booking_id: beds24BookingId // Beds24メッセージ送信に使用
                    },
                    successUrl: successUrl,
                    cancelUrl: currentUrl
                })
            });

            const data = await res.json();

            if (data.sessionId) {
                // guidebook-lake-house.html で定義した stripe を使用
                stripe.redirectToCheckout({ sessionId: data.sessionId });
            } else {
                alert(window.currentLang === 'jp' ? "決済開始に失敗しました" : "Failed to start checkout");
            }
        } catch (error) {
            console.error("Stripe error:", error);
            alert(window.currentLang === 'jp' ? "エラーが発生しました。もう一度お試しください。" : "An error occurred. Please try again.");
        }

    } else {
        alert(window.currentLang === 'jp' ? "このオプションはまだオンライン決済未対応です。" : "This option is not available for online payment yet.");
    }
}


// ============================================
// EXPORTS (for potential API use)
// ============================================
// ============================================
// SERVICE MODAL HELPER
// ============================================

function createServiceModal() {
    if (document.getElementById('service-modal')) return;

    const modalHTML = `
    <div id="service-modal" class="modal-overlay" onclick="if(event.target === this) closeServiceModal()">
        <div class="modal-content">
            <button class="modal-close" onclick="closeServiceModal()">×</button>
            <div id="service-modal-body" class="modal-body">
                <!-- Content injected by JS -->
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    document.addEventListener('keydown', function (e) {
        if (e.key === "Escape") closeServiceModal();
    });
}

window.openServiceModal = function (serviceId) {
    const service = guidebookData.services.find(s => s.id === serviceId);
    if (!service || !service.modalDetails) return;

    createServiceModal(); // Ensure exists

    const details = service.modalDetails;
    const lang = getLang();
    const t = window.I18N ? { get: (k) => window.getI18n(k, lang) } : {};
    const getT = (k) => window.getI18n ? window.getI18n(k, lang) : (window.translations?.[lang]?.[k] ?? '');
    const reserveBtnText = getT('guidebook.services.reserve') || (lang === 'jp' ? '予約する' : 'Reserve');

    const getTxt = (obj) => getLocalizedText(obj);

    const html = `
        <div class="modal-title">${getTxt(details.title)}</div>
        
        <div class="modal-section">
            <div class="modal-text">${getTxt(details.overview)}</div>
        </div>

        <div class="modal-section">
             <div class="modal-label">${getTxt(details.priceLabel)}</div>
             <div class="modal-text" style="font-size: 1.25em; font-weight: bold;">${details.priceValue}</div>
        </div>
        
        <div class="modal-section">
             <div class="modal-label">${getTxt(details.periodLabel)}</div>
             <div class="modal-text">${getTxt(details.periodValue)}</div>
        </div>

        <div class="modal-section">
             <div class="modal-label">${getTxt(details.includesLabel)}</div>
             <div class="modal-text">${getTxt(details.includesValue)}</div>
        </div>

        <div class="modal-section">
             <div class="modal-label">${getTxt(details.flowLabel)}</div>
             <div class="modal-text">${getTxt(details.flowValue)}</div>
        </div>

        <div class="modal-section">
             <div class="modal-label">${getTxt(details.notesLabel)}</div>
             <div class="modal-text">${getTxt(details.notesValue)}</div>
        </div>

        <div class="modal-action">
            <button class="modal-btn" onclick="handleServiceClick(${service.id})">${reserveBtnText}</button>
        </div>
    `;

    const body = document.getElementById('service-modal-body');
    if (body) {
        body.innerHTML = html;
        const modal = document.getElementById('service-modal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }
};

window.closeServiceModal = function () {
    const modal = document.getElementById('service-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

window.guidebookData = guidebookData;

// Helper to update the mobile language label
function updateLanguageLabel() {
    const label = document.getElementById('mobile-lang-label');
    if (label) {
        label.textContent = (window.currentLang || 'en').toUpperCase();
    }
}

// ============================================
// DINING ACCORDION HELPER
// ============================================
window.toggleDiningAccordion = function (headerElement) {
    const groupStart = headerElement.parentElement;
    const list = groupStart.querySelector('ul.guide-list');

    if (!list) return;

    // Toggle hidden items
    const hiddenItems = list.querySelectorAll('li:not(:first-child)');
    const isExpanded = headerElement.getAttribute('data-expanded') === 'true';
    const icon = headerElement.querySelector('.accordion-icon');

    if (isExpanded) {
        // Collapse
        hiddenItems.forEach(item => {
            item.style.display = 'none';
        });
        headerElement.setAttribute('data-expanded', 'false');
        if (icon) icon.textContent = '▶';
    } else {
        // Expand
        hiddenItems.forEach(item => {
            item.style.display = 'block'; // Reset to default display
        });
        headerElement.setAttribute('data-expanded', 'true');
        if (icon) icon.textContent = '▼';
    }
};
