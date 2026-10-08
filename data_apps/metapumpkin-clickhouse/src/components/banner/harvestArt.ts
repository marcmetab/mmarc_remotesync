/*
 * The harvest world's art (HarvestScene.tsx): one strip 2400 wide, Business's hill road on the left half and the
 * Stores market stall on the right, drawn in four depths that pan at their own speeds (sky, far hills, mid hills
 * with the barn and the trees, the near ground with the roads, the stall and the van). The view box shows 1200 of it.
 * Plain SVG markup, turned into React elements by svgElement (never innerHTML: the host's sanitizer would rewrite it);
 * the classes (sc-*) are what harvest.css animates. Drawn from the Golden Hour banners (src/assets/banner-*.svg).
 */

export const DEFS = `<defs>
<linearGradient id="pd-sc-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f8e0d3"/><stop offset=".45" stop-color="#fbd3ae"/><stop offset=".72" stop-color="#f8b77f"/></linearGradient>
<radialGradient id="pd-sc-lamp"><stop offset="0" stop-color="#ffe9b8" stop-opacity=".9"/><stop offset="1" stop-color="#ffe9b8" stop-opacity="0"/></radialGradient>
<pattern id="pd-sc-pk" width="34" height="18" patternUnits="userSpaceOnUse">
<ellipse cx="24" cy="13" rx="6" ry="2.4" fill="#7f8a45"/>
<ellipse cx="8" cy="9" rx="5" ry="5.4" fill="#d9601c"/><ellipse cx="14" cy="9" rx="5" ry="5.4" fill="#d9601c"/><ellipse cx="11" cy="9" rx="4" ry="6" fill="#f08a3c"/><rect x="10.2" y="1.8" width="1.6" height="2.6" rx=".6" fill="#6c7a36"/>
</pattern>
<pattern id="pd-sc-pk2" width="34" height="18" patternUnits="userSpaceOnUse" patternTransform="translate(17 4) scale(1.15)">
<ellipse cx="24" cy="13" rx="6" ry="2.4" fill="#7f8a45"/>
<ellipse cx="8" cy="9" rx="5" ry="5.4" fill="#d9601c"/><ellipse cx="14" cy="9" rx="5" ry="5.4" fill="#d9601c"/><ellipse cx="11" cy="9" rx="4" ry="6" fill="#f08a3c"/><rect x="10.2" y="1.8" width="1.6" height="2.6" rx=".6" fill="#6c7a36"/>
</pattern>
</defs>`;

export const SKY = `<g class="sc-sky">
<rect x="-200" y="-400" width="1800" height="820" fill="#f8e0d3"/>
<rect x="-200" y="150" width="1800" height="270" fill="url(#pd-sc-sky)"/>
<circle class="sc-halo" cx="968" cy="242" r="92" fill="#fff1d4" opacity=".28"/>
<circle class="sc-halo sc-h2" cx="968" cy="242" r="62" fill="#fff1d4" opacity=".4"/>
<circle cx="968" cy="242" r="38" fill="#fff6e2"/>
<g class="sc-clouds">
<rect x="700" y="228" width="150" height="7" rx="3.5" fill="#fdeee2" opacity=".8"/>
<rect x="760" y="241" width="84" height="5" rx="2.5" fill="#fdeee2" opacity=".7"/>
<rect x="1050" y="224" width="150" height="7" rx="3.5" fill="#fdeee2" opacity=".8"/>
<rect x="1080" y="238" width="70" height="5" rx="2.5" fill="#fdeee2" opacity=".65"/>
<rect x="560" y="256" width="90" height="5" rx="2.5" fill="#fde6cf" opacity=".8"/>
<rect x="230" y="236" width="110" height="6" rx="3" fill="#fdeee2" opacity=".6"/>
<rect x="1240" y="250" width="96" height="5" rx="2.5" fill="#fde6cf" opacity=".7"/>
</g>
<g transform="translate(0 246)"><g class="sc-flock">
<path class="sc-bird" d="M0 0q4-4 8 0q4-4 8 0"/>
<path class="sc-bird sc-b2" d="M20 7q3-3 6 0q3-3 6 0"/>
<path class="sc-bird sc-b3" d="M-14 9q3-3 6 0q3-3 6 0"/>
</g></g>
</g>`;

export const FAR = `<g class="sc-far">
<g transform="translate(0 30)">
<path d="M0 240C120 205 220 200 330 225S520 250 640 222S860 190 980 215S1130 240 1200 220V420H0Z" fill="#d6a39b"/>
<path d="M0 268C150 240 260 250 400 262S620 232 760 252S1000 280 1200 244V420H0Z" fill="#a8667a"/>
</g>
<g transform="translate(2400 30) scale(-1 1)">
<path d="M0 240C120 205 220 200 330 225S520 250 640 222S860 190 980 215S1130 240 1200 220V420H0Z" fill="#d6a39b"/>
<path d="M0 268C150 240 260 250 400 262S620 232 760 252S1000 280 1200 244V420H0Z" fill="#a8667a"/>
</g>
</g>`;

export const MID = `<g class="sc-mid">
<g transform="translate(0 30)">
<path d="M0 285C140 262 300 262 460 292S700 310 780 306V420H0Z" fill="#c9683c"/>
<path d="M500 312C680 284 860 268 1020 280S1160 296 1200 290V420H500Z" fill="#e3a047"/>
<path d="M118 262l14 -11 14 11v12h-28z" fill="#7a3a2a"/>
<rect x="150" y="256" width="8" height="18" rx="2" fill="#7a3a2a"/>
</g>
<g transform="translate(2400 30) scale(-1 1)">
<path d="M0 285C140 262 300 262 460 292S700 310 780 306V420H0Z" fill="#c9683c"/>
<path d="M500 312C680 284 860 268 1020 280S1160 296 1200 290V420H500Z" fill="#e3a047"/>
</g>
<path d="M0 318C200 296 380 300 560 312S900 298 1200 316V420H0Z" fill="#8f9148"/>
<path d="M2400 318C2200 296 2020 300 1840 312S1500 298 1200 316V420H2400Z" fill="#8f9148"/>
<g class="sc-tree"><rect x="69" y="304" width="2" height="8" fill="#5a4030"/><ellipse cx="70" cy="297" rx="4.2" ry="11" fill="#55622e"/></g>
<g class="sc-tree sc-d1"><rect x="85" y="306" width="2" height="6.4" fill="#5a4030"/><ellipse cx="86" cy="300.8" rx="3.4" ry="8.8" fill="#55622e"/></g>
<g class="sc-tree sc-d2"><rect x="249" y="298" width="2" height="5.6" fill="#5a4030"/><ellipse cx="250" cy="293.7" rx="2.9" ry="7.7" fill="#55622e"/></g>
<g class="sc-tree sc-d3"><rect x="429" y="300" width="2" height="7.2" fill="#5a4030"/><ellipse cx="430" cy="293.9" rx="3.8" ry="9.9" fill="#55622e"/></g>
<g class="sc-tree sc-d1"><rect x="1089" y="302" width="2" height="8" fill="#5a4030"/><ellipse cx="1090" cy="295" rx="4.2" ry="11" fill="#55622e"/></g>
<g class="sc-tree sc-d2"><rect x="1107" y="304" width="2" height="6" fill="#5a4030"/><ellipse cx="1108" cy="299.3" rx="3.2" ry="8.3" fill="#55622e"/></g>
<g class="sc-tree"><rect x="1149" y="307" width="2" height="7.2" fill="#5a4030"/><ellipse cx="1150" cy="300.9" rx="3.8" ry="9.9" fill="#55622e"/></g>
<g class="sc-tree sc-d3"><rect x="1395" y="303" width="2" height="7" fill="#5a4030"/><ellipse cx="1396" cy="297" rx="3.8" ry="9.5" fill="#55622e"/></g>
<g class="sc-tree sc-d1"><rect x="1409" y="305" width="2" height="5.6" fill="#5a4030"/><ellipse cx="1410" cy="300.2" rx="3" ry="7.6" fill="#55622e"/></g>
<g class="sc-tree"><rect x="1571" y="301" width="2" height="6.3" fill="#5a4030"/><ellipse cx="1572" cy="295.6" rx="3.4" ry="8.6" fill="#55622e"/></g>
<g class="sc-tree sc-d2"><rect x="1731" y="304" width="2" height="7" fill="#5a4030"/><ellipse cx="1732" cy="298" rx="3.8" ry="9.5" fill="#55622e"/></g>
<g class="sc-tree sc-d3"><rect x="1747" y="306" width="2" height="5.2" fill="#5a4030"/><ellipse cx="1748" cy="301.5" rx="2.8" ry="7.1" fill="#55622e"/></g>
<g class="sc-tree sc-d1"><rect x="1835" y="302" width="2" height="6.3" fill="#5a4030"/><ellipse cx="1836" cy="296.6" rx="3.4" ry="8.6" fill="#55622e"/></g>
</g>`;

export const GROUND = `<g>
<path d="M0 346C220 326 420 328 620 334S1000 326 1200 340V420H0Z" fill="#5b3445"/>
<path d="M2400 346C2180 326 1980 328 1780 334S1400 326 1200 340V420H2400Z" fill="#5b3445"/>
<rect x="0" y="360" width="440" height="18" fill="url(#pd-sc-pk)"/>
<rect x="0" y="374" width="380" height="22" fill="url(#pd-sc-pk2)"/>
<rect x="900" y="341" width="300" height="18" fill="url(#pd-sc-pk)"/>
<rect x="1200" y="343" width="200" height="18" fill="url(#pd-sc-pk)"/>
<rect x="1324" y="352" width="470" height="18" fill="url(#pd-sc-pk)"/>
<path d="M260 470C380 400 520 364 700 352C820 344 930 335 984 322C1002 316 992 307 960 302C900 293 800 290 772 283C798 275 828 270 850 268L851 266C826 268 790 273 766 282C786 292 896 297 950 306C972 310 982 315 972 318C920 328 820 335 700 341C500 352 300 382 80 470Z" fill="#ecd8c0"/>
<path d="M620 356C820 350 1000 366 1200 370C1500 367 1800 366 2400 368V396H1200C1000 394 780 386 560 374Z" fill="#ecd8c0"/>
<path class="sc-dash" d="M175 470C350 394 510 358 700 346.5C820 339.5 925 330 978 320"/>
<path class="sc-dash2" d="M760 364C920 366 1060 376 1200 380L2400 379"/>
</g>`;

export const STALL = `<g transform="translate(1080 162)">
<ellipse cx="800" cy="204.5" rx="62" ry="3.4" fill="#3a2230" opacity=".22"/>
<g class="sc-pop sc-p1"><ellipse cx="785.8" cy="181" rx="5.5" ry="6.5" fill="#d9601c"/><ellipse cx="792.2" cy="181" rx="5.5" ry="6.5" fill="#d9601c"/><ellipse cx="789" cy="181" rx="4.6" ry="7" fill="#f08a3c"/><rect x="788.2" y="172" width="1.5" height="2.7" rx="1" fill="#6c7a36"/></g>
<g class="sc-pop sc-p2"><ellipse cx="799.5" cy="179.5" rx="6" ry="7.1" fill="#d9601c"/><ellipse cx="806.5" cy="179.5" rx="6" ry="7.1" fill="#d9601c"/><ellipse cx="803" cy="179.5" rx="5" ry="7.7" fill="#f08a3c"/><rect x="802.2" y="169.7" width="1.7" height="2.9" rx="1" fill="#6c7a36"/></g>
<g class="sc-pop sc-p3"><ellipse cx="813.9" cy="181" rx="5.3" ry="6.3" fill="#d9601c"/><ellipse cx="820.1" cy="181" rx="5.3" ry="6.3" fill="#d9601c"/><ellipse cx="817" cy="181" rx="4.5" ry="6.8" fill="#f08a3c"/><rect x="816.3" y="172.3" width="1.5" height="2.6" rx="1" fill="#6c7a36"/></g>
<rect x="778" y="184" width="50" height="20" rx="2" fill="#7a3a2a"/><rect x="778" y="192.4" width="50" height="2.4" fill="#5b2a20"/><rect x="781" y="184" width="3" height="20" fill="#5b2a20"/><rect x="822" y="184" width="3" height="20" fill="#5b2a20"/>
<g class="sc-pop sc-p4"><ellipse cx="837.2" cy="190" rx="4.8" ry="5.7" fill="#d9601c"/><ellipse cx="842.8" cy="190" rx="4.8" ry="5.7" fill="#d9601c"/><ellipse cx="840" cy="190" rx="4" ry="6.2" fill="#f08a3c"/><rect x="839.3" y="182.2" width="1.3" height="2.4" rx="1" fill="#6c7a36"/></g>
<g class="sc-pop sc-p5"><ellipse cx="849.4" cy="190.5" rx="4.5" ry="5.3" fill="#d9601c"/><ellipse cx="854.6" cy="190.5" rx="4.5" ry="5.3" fill="#d9601c"/><ellipse cx="852" cy="190.5" rx="3.7" ry="5.7" fill="#f08a3c"/><rect x="851.4" y="183.2" width="1.2" height="2.2" rx="1" fill="#6c7a36"/></g>
<rect x="832" y="192" width="28" height="12" rx="2" fill="#7a3a2a"/><rect x="832" y="197" width="28" height="2.4" fill="#5b2a20"/><rect x="835" y="192" width="3" height="12" fill="#5b2a20"/><rect x="854" y="192" width="3" height="12" fill="#5b2a20"/>
<g class="sc-hop sc-h2"><ellipse cx="749" cy="197" rx="5.2" ry="6.1" fill="#d9601c"/><ellipse cx="755" cy="197" rx="5.2" ry="6.1" fill="#d9601c"/><ellipse cx="752" cy="197" rx="4.3" ry="6.6" fill="#f08a3c"/><rect x="751.3" y="188.6" width="1.4" height="2.5" rx="1" fill="#6c7a36"/></g>
<g class="sc-hop sc-h3"><ellipse cx="762.7" cy="199" rx="4" ry="4.6" fill="#d9601c"/><ellipse cx="767.3" cy="199" rx="4" ry="4.6" fill="#d9601c"/><ellipse cx="765" cy="199" rx="3.3" ry="5.1" fill="#f08a3c"/><rect x="764.4" y="192.6" width="1.1" height="1.9" rx="1" fill="#6c7a36"/></g>
<ellipse cx="944" cy="205" rx="84" ry="3.6" fill="#3a2230" opacity=".22"/>
<rect x="877" y="116" width="5" height="88" fill="#3b1f2e"/><rect x="1006" y="116" width="5" height="88" fill="#3b1f2e"/>
<rect x="882" y="120" width="124" height="46" fill="#3a2230" opacity=".16"/>
<path d="M884 121Q913 129 944 121T1004 121" fill="none" stroke="#3b1f2e" stroke-width=".8"/>
<circle class="sc-bulb sc-k1" cx="890" cy="123" r="1.8"/><circle class="sc-bulb sc-k2" cx="902" cy="125" r="1.8"/><circle class="sc-bulb sc-k3" cx="914" cy="125.4" r="1.8"/><circle class="sc-bulb sc-k4" cx="926" cy="124" r="1.8"/><circle class="sc-bulb sc-k5" cx="962" cy="124" r="1.8"/><circle class="sc-bulb sc-k6" cx="974" cy="125.4" r="1.8"/><circle class="sc-bulb sc-k7" cx="986" cy="125" r="1.8"/><circle class="sc-bulb sc-k8" cx="998" cy="123" r="1.8"/>
<g class="sc-sign">
<rect x="932.4" y="117" width="1.2" height="11" fill="#3b1f2e"/><rect x="954.4" y="117" width="1.2" height="11" fill="#3b1f2e"/>
<rect x="925" y="127" width="38" height="18" rx="3" fill="#fdeee2"/>
<ellipse cx="941.7" cy="137" rx="4" ry="4.6" fill="#d9601c"/><ellipse cx="946.3" cy="137" rx="4" ry="4.6" fill="#d9601c"/><ellipse cx="944" cy="137" rx="3.3" ry="5.1" fill="#f08a3c"/><rect x="943.4" y="130.6" width="1.1" height="1.9" rx="1" fill="#6c7a36"/>
</g>
<g class="sc-hop sc-sold sc-n1"><ellipse cx="889" cy="152.5" rx="6.9" ry="8.1" fill="#d9601c"/><ellipse cx="897" cy="152.5" rx="6.9" ry="8.1" fill="#d9601c"/><ellipse cx="893" cy="152.5" rx="5.8" ry="8.8" fill="#f08a3c"/><rect x="892" y="141.3" width="1.9" height="3.4" rx="1" fill="#6c7a36"/></g>
<g class="sc-hop sc-h2 sc-sold sc-n2"><ellipse cx="907.3" cy="151" rx="8.1" ry="9.5" fill="#d9601c"/><ellipse cx="916.7" cy="151" rx="8.1" ry="9.5" fill="#d9601c"/><ellipse cx="912" cy="151" rx="6.8" ry="10.3" fill="#f08a3c"/><rect x="910.9" y="137.8" width="2.3" height="3.9" rx="1" fill="#6c7a36"/></g>
<g class="sc-hop sc-h1"><ellipse cx="973.5" cy="151.5" rx="7.7" ry="9.1" fill="#d9601c"/><ellipse cx="982.5" cy="151.5" rx="7.7" ry="9.1" fill="#d9601c"/><ellipse cx="978" cy="151.5" rx="6.5" ry="9.9" fill="#f08a3c"/><rect x="976.9" y="138.9" width="2.2" height="3.8" rx="1" fill="#6c7a36"/></g>
<g class="sc-hop sc-h3"><ellipse cx="993.2" cy="153" rx="6.5" ry="7.7" fill="#d9601c"/><ellipse cx="1000.8" cy="153" rx="6.5" ry="7.7" fill="#d9601c"/><ellipse cx="997" cy="153" rx="5.5" ry="8.4" fill="#f08a3c"/><rect x="996.1" y="142.4" width="1.8" height="3.2" rx="1" fill="#6c7a36"/></g>
<g class="sc-hop sc-h1 sc-sold sc-n3"><ellipse cx="930.5" cy="153.5" rx="6" ry="7.1" fill="#d9601c"/><ellipse cx="937.5" cy="153.5" rx="6" ry="7.1" fill="#d9601c"/><ellipse cx="934" cy="153.5" rx="5" ry="7.7" fill="#f08a3c"/><rect x="933.2" y="143.7" width="1.7" height="2.9" rx="1" fill="#6c7a36"/></g>
<g class="sc-hop sc-sold sc-n4"><ellipse cx="952.3" cy="153" rx="6.4" ry="7.5" fill="#d9601c"/><ellipse cx="959.7" cy="153" rx="6.4" ry="7.5" fill="#d9601c"/><ellipse cx="956" cy="153" rx="5.3" ry="8.1" fill="#f08a3c"/><rect x="955.1" y="142.6" width="1.8" height="3.1" rx="1" fill="#6c7a36"/></g>
<rect x="872" y="168" width="144" height="36" rx="3" fill="#4a2638"/>
<rect x="896" y="168" width="2" height="36" fill="#3b1f2e"/><rect x="920" y="168" width="2" height="36" fill="#3b1f2e"/><rect x="944" y="168" width="2" height="36" fill="#3b1f2e"/><rect x="968" y="168" width="2" height="36" fill="#3b1f2e"/><rect x="992" y="168" width="2" height="36" fill="#3b1f2e"/>
<rect x="868" y="163" width="152" height="7" rx="2.5" fill="#6a3c4f"/>
<path class="sc-flap" d="M866 100H879V117A6.5 6.5 0 0 1 866 117Z" fill="#c9683c"/>
<path class="sc-flap sc-a1" d="M879 100H892V117A6.5 6.5 0 0 1 879 117Z" fill="#fdeee2"/>
<path class="sc-flap sc-a2" d="M892 100H905V117A6.5 6.5 0 0 1 892 117Z" fill="#c9683c"/>
<path class="sc-flap sc-a3" d="M905 100H918V117A6.5 6.5 0 0 1 905 117Z" fill="#fdeee2"/>
<path class="sc-flap" d="M918 100H931V117A6.5 6.5 0 0 1 918 117Z" fill="#c9683c"/>
<path class="sc-flap sc-a1" d="M931 100H944V117A6.5 6.5 0 0 1 931 117Z" fill="#fdeee2"/>
<path class="sc-flap sc-a2" d="M944 100H957V117A6.5 6.5 0 0 1 944 117Z" fill="#c9683c"/>
<path class="sc-flap sc-a3" d="M957 100H970V117A6.5 6.5 0 0 1 957 117Z" fill="#fdeee2"/>
<path class="sc-flap" d="M970 100H983V117A6.5 6.5 0 0 1 970 117Z" fill="#c9683c"/>
<path class="sc-flap sc-a1" d="M983 100H996V117A6.5 6.5 0 0 1 983 117Z" fill="#fdeee2"/>
<path class="sc-flap sc-a2" d="M996 100H1009V117A6.5 6.5 0 0 1 996 117Z" fill="#c9683c"/>
<path class="sc-flap sc-a3" d="M1009 100H1022V117A6.5 6.5 0 0 1 1009 117Z" fill="#fdeee2"/>
<rect x="863" y="96.5" width="162" height="5" rx="2.5" fill="#7a3a2a"/>
<g class="sc-hop sc-h1"><ellipse cx="1027.8" cy="200" rx="3.8" ry="4.4" fill="#d9601c"/><ellipse cx="1032.2" cy="200" rx="3.8" ry="4.4" fill="#d9601c"/><ellipse cx="1030" cy="200" rx="3.2" ry="4.8" fill="#f08a3c"/></g>
</g>`;

export const TRUCK = `<g class="sc-truck"><g class="sc-face"><g class="sc-drive">
<ellipse cx="66" cy="5" rx="104" ry="4.6" fill="#3a2230" opacity=".22"/>
<circle class="sc-puff" cx="-12" cy="-3" r="5" fill="#ecd0b2"/>
<circle class="sc-puff sc-q2" cx="-12" cy="-3" r="5" fill="#ecd0b2"/>
<circle class="sc-puff sc-q3" cx="-12" cy="-3" r="5" fill="#ecd0b2"/>
<g class="sc-body">
<circle class="sc-lamp" cx="182" cy="-40" r="26" fill="url(#pd-sc-lamp)"/>
<g class="sc-cargo">
<ellipse cx="9" cy="-56" rx="8.6" ry="10.1" fill="#d9601c"/><ellipse cx="19" cy="-56" rx="8.6" ry="10.1" fill="#d9601c"/><ellipse cx="14" cy="-56" rx="7.2" ry="11" fill="#f08a3c"/><rect x="12.8" y="-70" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="31.5" cy="-58" rx="9.4" ry="10.9" fill="#d9601c"/><ellipse cx="42.5" cy="-58" rx="9.4" ry="10.9" fill="#d9601c"/><ellipse cx="37" cy="-58" rx="7.8" ry="12" fill="#f08a3c"/><rect x="35.8" y="-73" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="55.8" cy="-57" rx="9" ry="10.5" fill="#d9601c"/><ellipse cx="66.3" cy="-57" rx="9" ry="10.5" fill="#d9601c"/><ellipse cx="61" cy="-57" rx="7.5" ry="11.5" fill="#f08a3c"/><rect x="59.8" y="-71.5" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="78" cy="-55" rx="8.6" ry="10.1" fill="#d9601c"/><ellipse cx="88" cy="-55" rx="8.6" ry="10.1" fill="#d9601c"/><ellipse cx="83" cy="-55" rx="7.2" ry="11" fill="#f08a3c"/><rect x="81.8" y="-69" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="20.2" cy="-73" rx="8.3" ry="9.7" fill="#d9601c"/><ellipse cx="29.8" cy="-73" rx="8.3" ry="9.7" fill="#d9601c"/><ellipse cx="25" cy="-73" rx="6.9" ry="10.6" fill="#f08a3c"/><rect x="23.8" y="-86.6" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="43.8" cy="-76" rx="9" ry="10.5" fill="#d9601c"/><ellipse cx="54.3" cy="-76" rx="9" ry="10.5" fill="#d9601c"/><ellipse cx="49" cy="-76" rx="7.5" ry="11.5" fill="#f08a3c"/><rect x="47.8" y="-90.5" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="67.2" cy="-73" rx="8.3" ry="9.7" fill="#d9601c"/><ellipse cx="76.8" cy="-73" rx="8.3" ry="9.7" fill="#d9601c"/><ellipse cx="72" cy="-73" rx="6.9" ry="10.6" fill="#f08a3c"/><rect x="70.8" y="-86.6" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="33.6" cy="-90" rx="7.6" ry="8.8" fill="#d9601c"/><ellipse cx="42.4" cy="-90" rx="7.6" ry="8.8" fill="#d9601c"/><ellipse cx="38" cy="-90" rx="6.3" ry="9.7" fill="#f08a3c"/><rect x="36.8" y="-102.7" width="2.4" height="4" rx="1" fill="#6c7a36"/>
<ellipse cx="55.4" cy="-91" rx="7.9" ry="9.2" fill="#d9601c"/><ellipse cx="64.6" cy="-91" rx="7.9" ry="9.2" fill="#d9601c"/><ellipse cx="60" cy="-91" rx="6.6" ry="10.1" fill="#f08a3c"/><rect x="58.8" y="-104.1" width="2.4" height="4" rx="1" fill="#6c7a36"/>
</g>
<rect x="-2" y="-52" width="100" height="27" rx="3" fill="#4a2638"/>
<rect x="5" y="-64" width="5" height="38" rx="2" fill="#3b1f2e"/><rect x="34" y="-64" width="5" height="38" rx="2" fill="#3b1f2e"/><rect x="63" y="-64" width="5" height="38" rx="2" fill="#3b1f2e"/><rect x="90" y="-64" width="5" height="38" rx="2" fill="#3b1f2e"/>
<rect x="-2" y="-44" width="100" height="3" fill="#6a3c4f"/>
<path d="M102 -22V-72Q102 -80 110 -80H130Q137 -80 141 -73L152 -52H164Q174 -52 174 -42V-22Z" fill="#3b1f2e"/>
<path d="M110 -72H129Q132 -72 134 -69L142 -53H110Z" fill="#fbd9b0"/>
<rect x="-6" y="-26" width="182" height="9" rx="3" fill="#3b1f2e"/>
<circle cx="171" cy="-40" r="3.4" fill="#ffe9b8"/>
</g>
<g class="sc-wheel"><circle cx="28" cy="-10" r="14" fill="#2e1824"/><rect x="26.9" y="-21" width="2.2" height="22" rx="1" fill="#6a4a58"/><rect x="17" y="-11.1" width="22" height="2.2" rx="1" fill="#6a4a58"/><circle cx="28" cy="-10" r="5.5" fill="#e9c9a8"/></g>
<g class="sc-wheel"><circle cx="140" cy="-10" r="14" fill="#2e1824"/><rect x="138.9" y="-21" width="2.2" height="22" rx="1" fill="#6a4a58"/><rect x="129" y="-11.1" width="22" height="2.2" rx="1" fill="#6a4a58"/><circle cx="140" cy="-10" r="5.5" fill="#e9c9a8"/></g>
</g></g></g>`;

export const FIREFLIES = `<g>
<circle class="sc-ff" cx="96" cy="342" r="1.7" fill="#ffe7a3"/>
<circle class="sc-ff sc-f2" cx="214" cy="351" r="1.5" fill="#ffe7a3"/>
<circle class="sc-ff sc-f3" cx="330" cy="338" r="1.8" fill="#ffe7a3"/>
<circle class="sc-ff sc-f4" cx="812" cy="347" r="1.6" fill="#ffe7a3"/>
<circle class="sc-ff sc-f5" cx="1046" cy="340" r="1.8" fill="#ffe7a3"/>
<circle class="sc-ff sc-f6" cx="1420" cy="342" r="1.5" fill="#ffe7a3"/>
<circle class="sc-ff sc-f7" cx="1610" cy="346" r="1.7" fill="#ffe7a3"/>
<circle class="sc-ff sc-f2" cx="1790" cy="340" r="1.6" fill="#ffe7a3"/>
<circle class="sc-ff sc-f5" cx="2290" cy="345" r="1.7" fill="#ffe7a3"/>
</g>`;
