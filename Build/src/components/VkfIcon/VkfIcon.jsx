/*
 * Created by tom.schulze@pikobytes.de on 07.11.24.
 *
 * This file is subject to the terms and conditions defined in
 * file "LICENSE.txt", which is part of this source code package.
 */

import React from "react";
import PropTypes from "prop-types";

import { GEOMETRY_TYPE } from "@map/components/GeoJson/constants";

// TODO SVG ICON - merge with SvgIcons component?

const icons = {
  addVectorMap: (
    <svg
      width="20"
      height="16"
      viewBox="0 0 20 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.3888 13.0958C5.31376 12.9926 5.21482 12.9091 5.10047 12.8525C4.19363 12.4067 3.42983 11.7158 2.89568 10.8581C2.36152 10.0003 2.0784 9.01005 2.0784 7.99957C2.0784 6.9891 2.36152 5.99884 2.89568 5.14109C3.42983 4.28334 4.19363 3.59241 5.10047 3.14666C5.21477 3.09032 5.3137 3.00711 5.3888 2.90416L5.4063 2.87916C5.51654 2.73062 5.57378 2.54941 5.56886 2.3645C5.56394 2.17959 5.49715 2.00167 5.37917 1.85921C5.26118 1.71674 5.09883 1.61797 4.91808 1.57868C4.73732 1.53939 4.54861 1.56186 4.38214 1.64249C3.19133 2.22398 2.18778 3.12823 1.48579 4.25223C0.783811 5.37623 0.411621 6.67479 0.411621 7.99999C0.411621 9.32519 0.783811 10.6237 1.48579 11.7477C2.18778 12.8717 3.19133 13.776 4.38214 14.3575C4.54869 14.4376 4.73726 14.4596 4.9178 14.4201C5.09833 14.3805 5.26043 14.2817 5.37826 14.1393C5.4961 13.997 5.56288 13.8192 5.56796 13.6345C5.57304 13.4498 5.51613 13.2686 5.4063 13.12L5.3888 13.0958Z"
        fill="currentColor"
      />
      <path
        d="M12.4946 0.5C11.0113 0.5 9.56122 0.939867 8.32785 1.76398C7.09449 2.58809 6.13319 3.75943 5.56554 5.12987C4.99788 6.50032 4.84935 8.00832 5.13874 9.46318C5.42813 10.918 6.14244 12.2544 7.19133 13.3033C8.24022 14.3522 9.5766 15.0665 11.0315 15.3559C12.4863 15.6453 13.9943 15.4968 15.3648 14.9291C16.7352 14.3614 17.9065 13.4001 18.7307 12.1668C19.5548 10.9334 19.9946 9.48336 19.9946 8C19.9924 6.01155 19.2015 4.10518 17.7955 2.69914C16.3895 1.29309 14.4831 0.502206 12.4946 0.5ZM12.4946 13.8333C11.3409 13.8333 10.2131 13.4912 9.25381 12.8502C8.29452 12.2093 7.54685 11.2982 7.10533 10.2323C6.66382 9.16642 6.5483 7.99353 6.77338 6.86197C6.99846 5.73042 7.55404 4.69102 8.36984 3.87521C9.18565 3.0594 10.225 2.50383 11.3566 2.27875C12.4882 2.05367 13.661 2.16919 14.727 2.6107C15.7929 3.05221 16.7039 3.79989 17.3449 4.75917C17.9858 5.71846 18.328 6.84628 18.328 8C18.3262 9.54655 17.7111 11.0293 16.6175 12.1228C15.5239 13.2164 14.0412 13.8316 12.4946 13.8333Z"
        fill="currentColor"
      />
      <path
        d="M15.6321 6.9583H13.7446C13.6893 6.9583 13.6364 6.93635 13.5973 6.89728C13.5582 6.85821 13.5363 6.80522 13.5363 6.74997V4.86247C13.5363 4.5862 13.4265 4.32125 13.2312 4.1259C13.0358 3.93055 12.7709 3.8208 12.4946 3.8208C12.2183 3.8208 11.9534 3.93055 11.758 4.1259C11.5627 4.32125 11.4529 4.5862 11.4529 4.86247V6.74997C11.4529 6.80522 11.431 6.85821 11.3919 6.89728C11.3528 6.93635 11.2999 6.9583 11.2446 6.9583H9.3571C9.08083 6.9583 8.81588 7.06805 8.62053 7.2634C8.42518 7.45875 8.31543 7.7237 8.31543 7.99997C8.31543 8.27623 8.42518 8.54119 8.62053 8.73654C8.81588 8.93189 9.08083 9.04163 9.3571 9.04163H11.2446C11.2999 9.04163 11.3528 9.06358 11.3919 9.10265C11.431 9.14172 11.4529 9.19471 11.4529 9.24997V11.1366C11.4529 11.4129 11.5627 11.6779 11.758 11.8732C11.9534 12.0686 12.2183 12.1783 12.4946 12.1783C12.7709 12.1783 13.0358 12.0686 13.2312 11.8732C13.4265 11.6779 13.5363 11.4129 13.5363 11.1366V9.24997C13.5363 9.19471 13.5582 9.14172 13.5973 9.10265C13.6364 9.06358 13.6893 9.04163 13.7446 9.04163H15.6321C15.9084 9.04163 16.1733 8.93189 16.3687 8.73654C16.564 8.54119 16.6738 8.27623 16.6738 7.99997C16.6738 7.7237 16.564 7.45875 16.3687 7.2634C16.1733 7.06805 15.9084 6.9583 15.6321 6.9583Z"
        fill="currentColor"
      />
    </svg>
  ),
  uploadVectorMap: (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M17.6616 10.5C13.9366 10.5 10.9116 13.525 10.9116 17.25C10.9116 20.975 13.9366 24 17.6616 24C21.3866 24 24.4116 20.975 24.4116 17.25C24.4116 13.525 21.3866 10.5 17.6616 10.5ZM17.6616 12C20.5596 12 22.9116 14.352 22.9116 17.25C22.9116 20.148 20.5596 22.5 17.6616 22.5C14.7636 22.5 12.4116 20.148 12.4116 17.25C12.4116 14.352 14.7636 12 17.6616 12ZM8.66162 19.5H2.66162C2.25062 19.5 1.91162 19.161 1.91162 18.75V2.25C1.91162 1.839 2.25062 1.5 2.66162 1.5H13.2896C13.4886 1.5 13.6796 1.579 13.8206 1.719L16.6936 4.591C16.8346 4.731 16.9136 4.922 16.9136 5.121V8.25C16.9136 8.664 17.2496 9 17.6636 9C18.0776 9 18.4136 8.664 18.4136 8.25V5.121C18.4136 4.524 18.1756 3.951 17.7536 3.529L14.8806 0.658C14.4586 0.237 13.8856 0 13.2896 0H2.66162C1.42762 0 0.411621 1.016 0.411621 2.25V18.75C0.411621 19.984 1.42762 21 2.66162 21H8.66162C9.07562 21 9.41162 20.664 9.41162 20.25C9.41162 19.836 9.07562 19.5 8.66162 19.5ZM8.88162 6.53L10.6006 8.25L8.88162 9.97C8.58862 10.262 8.58862 10.738 8.88162 11.03C9.17362 11.323 9.64962 11.323 9.94162 11.03L12.1916 8.78C12.4846 8.487 12.4846 8.013 12.1916 7.72L9.94162 5.47C9.64962 5.177 9.17362 5.177 8.88162 5.47C8.58862 5.762 8.58862 6.238 8.88162 6.53ZM5.88162 5.47L3.63162 7.72C3.33862 8.013 3.33862 8.487 3.63162 8.78L5.88162 11.03C6.17362 11.323 6.64962 11.323 6.94162 11.03C7.23462 10.738 7.23462 10.262 6.94162 9.97L5.22262 8.25L6.94162 6.53C7.23462 6.238 7.23462 5.762 6.94162 5.47C6.64962 5.177 6.17362 5.177 5.88162 5.47Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.7167 13.6361C18.2138 13.6361 18.6167 14.0391 18.6167 14.5361V19.8171C18.6167 20.3141 18.2138 20.7171 17.7167 20.7171C17.2197 20.7171 16.8167 20.3141 16.8167 19.8171L16.8167 14.5361C16.8167 14.0391 17.2197 13.6361 17.7167 13.6361Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21.2572 17.1766C21.2572 17.6736 20.8543 18.0766 20.3572 18.0766H15.0763C14.5792 18.0766 14.1763 17.6736 14.1763 17.1766C14.1763 16.6795 14.5792 16.2766 15.0763 16.2766L20.3572 16.2766C20.8543 16.2766 21.2572 16.6795 21.2572 17.1766Z"
        fill="currentColor"
      />
    </svg>
  ),
  edit: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
      <path d="M16.667 9.573a.833.833 0 0 0-.834.834v7.083a.834.834 0 0 1-.833.833H2.5a.833.833 0 0 1-.833-.833V3.323A.833.833 0 0 1 2.5 2.49h8.333a.833.833 0 0 0 0-1.667H2.5a2.5 2.5 0 0 0-2.5 2.5V17.49a2.5 2.5 0 0 0 2.5 2.5H15a2.5 2.5 0 0 0 2.5-2.5v-7.083a.833.833 0 0 0-.833-.834ZM19.513.482a1.706 1.706 0 0 0-2.357 0l-.884.884a.417.417 0 0 0 0 .589l1.767 1.767a.417.417 0 0 0 .59 0l.884-.884a1.666 1.666 0 0 0 0-2.356Z" />
      <path d="m9.466 8.762 1.767 1.767a.417.417 0 0 0 .59 0l5.303-5.303a.417.417 0 0 0 0-.59l-1.769-1.769a.43.43 0 0 0-.589 0L9.466 8.172a.417.417 0 0 0 0 .59ZM8.624 9.363a.422.422 0 0 0-.303.25l-1.01 2.529a.416.416 0 0 0 .092.449.44.44 0 0 0 .45.092l2.525-1.01a.417.417 0 0 0 .14-.681L9 9.477a.417.417 0 0 0-.376-.114Z" />
    </svg>
  ),
  "edit-inverse": (
    <svg viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.98408 8.41697C7.87252 8.52907 7.73909 8.61704 7.59208 8.67538L5.53 9.50197C5.31774 9.58487 5.08603 9.60464 4.86279 9.5589C4.63955 9.51315 4.4343 9.40384 4.27175 9.24413C4.11028 9.0827 3.99972 8.87744 3.95379 8.65377C3.90785 8.43011 3.92856 8.19789 4.01333 7.98588L4.83758 5.92497C4.89649 5.77794 4.9846 5.64439 5.09658 5.53238L8.53067 2.09772C8.55074 2.07732 8.56439 2.05149 8.56994 2.02342C8.57549 1.99535 8.57269 1.96627 8.5619 1.93977C8.5511 1.91327 8.53277 1.89052 8.50918 1.87432C8.48559 1.85812 8.45778 1.84919 8.42917 1.84863H1.81883C1.33645 1.84863 0.873821 2.04026 0.532724 2.38136C0.191627 2.72245 0 3.18508 0 3.66747V11.6971C-1.22907e-08 11.9359 0.0470497 12.1724 0.138462 12.393C0.229874 12.6136 0.363857 12.8141 0.532759 12.983C0.701661 13.1518 0.902173 13.2857 1.12284 13.3771C1.34351 13.4684 1.58001 13.5154 1.81883 13.5153H9.84842C10.0872 13.5154 10.3237 13.4684 10.5443 13.3771C10.765 13.2857 10.9654 13.1518 11.1343 12.9829C11.3031 12.8141 11.4371 12.6136 11.5284 12.393C11.6198 12.1723 11.6667 11.9358 11.6667 11.6971V5.08847C11.6666 5.05971 11.658 5.03161 11.642 5.0077C11.6261 4.98379 11.6033 4.96515 11.5768 4.95412C11.5502 4.94308 11.521 4.94014 11.4928 4.94568C11.4646 4.95121 11.4386 4.96497 11.4182 4.98522L7.98408 8.41697Z" />
      <path d="M10.8312 1.77357C10.7755 1.72081 10.7017 1.69141 10.625 1.69141C10.5483 1.69141 10.4745 1.72081 10.4188 1.77357L5.8612 6.33174C5.83328 6.35975 5.81127 6.39307 5.79645 6.42974L4.97162 8.49241C4.95035 8.54548 4.94514 8.60363 4.95666 8.65964C4.96817 8.71564 4.99589 8.76703 5.03637 8.80741C5.0775 8.84649 5.12878 8.87323 5.18437 8.88457C5.23997 8.89592 5.29763 8.89142 5.35078 8.87157L7.41287 8.04674C7.44959 8.03203 7.48293 8.01 7.51087 7.98199L12.069 3.42441C12.1237 3.36971 12.1544 3.29554 12.1544 3.2182C12.1544 3.14086 12.1237 3.06669 12.069 3.01199L10.8312 1.77357Z" />
      <path d="M13.513 1.98011C13.7317 1.76133 13.8546 1.46464 13.8546 1.15528C13.8546 0.845921 13.7317 0.549228 13.513 0.330445C13.2908 0.118342 12.9954 0 12.6882 0C12.381 0 12.0856 0.118342 11.8634 0.330445L11.2444 0.949362C11.2354 0.961013 11.2272 0.973295 11.2199 0.986112C11.1818 1.03444 11.1604 1.09377 11.1587 1.15528C11.1587 1.19365 11.1663 1.23164 11.181 1.26707C11.1957 1.30251 11.2173 1.33469 11.2444 1.36178L12.4834 2.59903C12.5324 2.64926 12.5983 2.67943 12.6683 2.68364C12.7383 2.68785 12.8074 2.66579 12.862 2.62178C12.8739 2.61508 12.8852 2.60747 12.8959 2.59903L13.513 1.98011Z" />
    </svg>
  ),
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
      <path d="M0 0h30v30H0z" />
      <path
        stroke="#fff"
        strokeWidth="2"
        d="M0-1h15.582"
        transform="scale(.98773 1.01212) rotate(45 -7.565 16.188)"
      />
      <path
        stroke="#fff"
        strokeWidth="2"
        d="M0-1h15.582"
        transform="matrix(-.69843 .71568 -.69843 -.71568 19.883 9)"
      />
    </svg>
  ),
  add: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 19 19">
      <path d="M.875 9A8.625 8.625 0 1 0 9.5.375 8.635 8.635 0 0 0 .875 9Zm3.75-.375a.75.75 0 0 1 .75-.75h2.813a.187.187 0 0 0 .187-.188V4.876a.75.75 0 0 1 .75-.75h.75a.75.75 0 0 1 .75.75v2.813a.188.188 0 0 0 .188.187h2.812a.75.75 0 0 1 .75.75v.75a.75.75 0 0 1-.75.75h-2.813a.188.188 0 0 0-.187.188v2.812a.75.75 0 0 1-.75.75h-.75a.75.75 0 0 1-.75-.75v-2.813a.188.188 0 0 0-.188-.187H5.376a.75.75 0 0 1-.75-.75v-.75Z" />
    </svg>
  ),
  delete: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
      <path d="M14.354 6.748H3.103a.375.375 0 0 0-.375.375V16.5a1.5 1.5 0 0 0 1.5 1.5h9.001a1.5 1.5 0 0 0 1.5-1.5V7.123a.375.375 0 0 0-.375-.375Zm-6.938 8.627a.563.563 0 1 1-1.125 0V9.749a.563.563 0 1 1 1.125 0v5.626Zm3.75 0a.563.563 0 1 1-1.125 0V9.749a.563.563 0 0 1 1.125 0v5.626ZM15.337 1.912l-3.498.675a.188.188 0 0 1-.22-.15l-.178-.92A1.875 1.875 0 0 0 9.244.033l-3.68.714A1.875 1.875 0 0 0 4.08 2.945l.178.92a.187.187 0 0 1-.15.22l-3.498.676a.75.75 0 0 0-.596.878.774.774 0 0 0 .88.595l14.729-2.85a.75.75 0 1 0-.285-1.474v.002Zm-9.788.75a.375.375 0 0 1 .3-.44l3.683-.712a.375.375 0 0 1 .438.3l.179.922a.188.188 0 0 1-.15.22l-4.052.776a.187.187 0 0 1-.22-.15l-.178-.916Z" />
    </svg>
  ),
  discard: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <path d="m5 5 4.125 4.125M11 5l-6 6" />
      <path d="M14.667 0H1.333A1.333 1.333 0 0 0 0 1.333v13.334A1.333 1.333 0 0 0 1.333 16h9.334c.177 0 .346-.07.471-.195l4.667-4.667a.667.667 0 0 0 .195-.471V1.333A1.334 1.334 0 0 0 14.667 0ZM1.333 1.667a.333.333 0 0 1 .334-.334h12.666a.333.333 0 0 1 .334.334V10a.333.333 0 0 1-.334.333h-2.666a1.333 1.333 0 0 0-1.334 1.334v2.666a.333.333 0 0 1-.333.334H1.667a.333.333 0 0 1-.334-.334V1.667Z" />
    </svg>
  ),
  save: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
      <path d="M12.0122 5.20332C12.0936 5.10023 12.154 4.98212 12.1897 4.85572C12.2255 4.72932 12.236 4.59711 12.2207 4.46665C12.2054 4.33618 12.1645 4.21001 12.1004 4.09534C12.0364 3.98067 11.9503 3.87974 11.8472 3.79832C11.7441 3.7169 11.626 3.65658 11.4996 3.62081C11.3732 3.58504 11.241 3.57451 11.1106 3.58984C10.9801 3.60516 10.8539 3.64603 10.7392 3.71011C10.6246 3.77419 10.5236 3.86023 10.4422 3.96332L6.71356 8.68665C6.69905 8.70522 6.68075 8.72048 6.65989 8.73143C6.63902 8.74238 6.61606 8.74876 6.59254 8.75015C6.56902 8.75153 6.54547 8.7479 6.52346 8.73948C6.50145 8.73106 6.48149 8.71805 6.46489 8.70132L5.04823 7.28465C4.85963 7.1025 4.60702 7.0017 4.34483 7.00398C4.08263 7.00626 3.83182 7.11143 3.64641 7.29684C3.461 7.48224 3.35583 7.73306 3.35355 7.99525C3.35128 8.25745 3.45207 8.51005 3.63423 8.69865L5.44823 10.5133C5.61595 10.6772 5.81604 10.8042 6.0357 10.8863C6.25536 10.9684 6.48974 11.0037 6.72383 10.99C6.95792 10.9762 7.18656 10.9137 7.3951 10.8065C7.60365 10.6993 7.7875 10.5497 7.93489 10.3673L12.0122 5.20332Z" />
      <path d="M14.6667 0H1.33333C0.979711 0 0.640573 0.140476 0.390524 0.390524C0.140476 0.640573 0 0.979711 0 1.33333L0 14.6667C0 15.0203 0.140476 15.3594 0.390524 15.6095C0.640573 15.8595 0.979711 16 1.33333 16H10.6667C10.8435 16 11.013 15.9297 11.138 15.8047L15.8047 11.138C15.9297 11.013 16 10.8435 16 10.6667V1.33333C16 0.979711 15.8595 0.640573 15.6095 0.390524C15.3594 0.140476 15.0203 0 14.6667 0ZM1.33333 1.66667C1.33333 1.57826 1.36845 1.49348 1.43096 1.43096C1.49348 1.36845 1.57826 1.33333 1.66667 1.33333H14.3333C14.4217 1.33333 14.5065 1.36845 14.569 1.43096C14.6315 1.49348 14.6667 1.57826 14.6667 1.66667V10C14.6667 10.0884 14.6315 10.1732 14.569 10.2357C14.5065 10.2982 14.4217 10.3333 14.3333 10.3333H11.6667C11.313 10.3333 10.9739 10.4738 10.7239 10.7239C10.4738 10.9739 10.3333 11.313 10.3333 11.6667V14.3333C10.3333 14.4217 10.2982 14.5065 10.2357 14.569C10.1732 14.6315 10.0884 14.6667 10 14.6667H1.66667C1.57826 14.6667 1.49348 14.6315 1.43096 14.569C1.36845 14.5065 1.33333 14.4217 1.33333 14.3333V1.66667Z" />
    </svg>
  ),
  caret: (
    <svg viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.9393 10.0607L14 11.1213L15.0607 10.0607L21.0607 4.06066L23.6213 1.5H20H8H4.37868L6.93934 4.06066L12.9393 10.0607Z"
        fill="#00655A"
        stroke="white"
        strokeWidth="3"
      />
    </svg>
  ),
  "export-geojson": (
    <svg viewBox="0 0 21 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.4136 1V16"
        stroke="#666666"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.91357 11.5L10.4136 16L14.9136 11.5"
        stroke="#666666"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.1636 4.74902H16.4116C17.2073 4.74902 17.9703 5.06509 18.5329 5.6277C19.0956 6.19031 19.4116 6.95337 19.4116 7.74902V20.499C19.4116 21.2947 19.0956 22.0577 18.5329 22.6203C17.9703 23.183 17.2073 23.499 16.4116 23.499H4.41162C3.61597 23.499 2.85291 23.183 2.2903 22.6203C1.72769 22.0577 1.41162 21.2947 1.41162 20.499V7.74902C1.41162 6.95337 1.72769 6.19031 2.2903 5.6277C2.85291 5.06509 3.61597 4.74902 4.41162 4.74902H6.66162"
        stroke="#666666"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  filter: (
    <svg viewBox="0 0 22 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M10.75 9.75C16.1348 9.75 20.5 7.73528 20.5 5.25C20.5 2.76472 16.1348 0.75 10.75 0.75C5.36522 0.75 1 2.76472 1 5.25C1 7.73528 5.36522 9.75 10.75 9.75Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1 5.25C1.00123 7.44343 1.74225 9.57232 3.10325 11.2924C4.46425 13.0126 6.36565 14.2233 8.5 14.729V21C8.5 21.5967 8.73705 22.169 9.15901 22.591C9.58097 23.0129 10.1533 23.25 10.75 23.25C11.3467 23.25 11.919 23.0129 12.341 22.591C12.7629 22.169 13 21.5967 13 21V14.729C15.1343 14.2233 17.0358 13.0126 18.3967 11.2924C19.7577 9.57232 20.4988 7.44343 20.5 5.25"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  "metadata-panel": (
    <svg viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0_1419_7239)">
        <path
          d="M12.2444 13.3538C12.7967 13.3538 13.2444 12.906 13.2444 12.3538C13.2444 11.8015 12.7967 11.3538 12.2444 11.3538C11.6921 11.3538 11.2444 11.8015 11.2444 12.3538C11.2444 12.906 11.6921 13.3538 12.2444 13.3538Z"
          fill="white"
        />
        <path
          d="M16.0896 11.4357C16.263 11.2498 16.3723 11.0132 16.4013 10.7606C16.4303 10.508 16.3774 10.2528 16.2506 10.0324C16.1237 9.8121 15.9296 9.63826 15.6966 9.53649C15.4636 9.43471 15.2041 9.41037 14.9562 9.46705L14.0155 9.68438C13.9412 9.70131 13.8631 9.6894 13.7972 9.65104C13.7312 9.61268 13.6823 9.55074 13.6602 9.47771L13.3775 8.54905C13.3044 8.30537 13.1546 8.09176 12.9505 7.93991C12.7463 7.78806 12.4986 7.70605 12.2442 7.70605C11.9898 7.70605 11.7421 7.78806 11.538 7.93991C11.3338 8.09176 11.1841 8.30537 11.1109 8.54905L10.8282 9.47771C10.806 9.55065 10.757 9.6125 10.6911 9.65083C10.6252 9.68916 10.5473 9.70115 10.4729 9.68438L9.53288 9.46638C9.28515 9.40991 9.02585 9.43436 8.79304 9.53613C8.56023 9.6379 8.36617 9.81162 8.23938 10.0318C8.11258 10.252 8.05971 10.507 8.08854 10.7595C8.11737 11.0119 8.22637 11.2485 8.39955 11.4344L9.05822 12.145C9.11026 12.2019 9.13913 12.2763 9.13913 12.3534C9.13913 12.4305 9.11026 12.5048 9.05822 12.5617L8.39955 13.271C8.22608 13.4569 8.11682 13.6936 8.08783 13.9461C8.05884 14.1987 8.11165 14.454 8.2385 14.6743C8.36535 14.8947 8.55955 15.0685 8.79254 15.1703C9.02553 15.272 9.28503 15.2964 9.53288 15.2397L10.4735 15.0224C10.548 15.0058 10.626 15.018 10.6919 15.0564C10.7577 15.0948 10.8067 15.1567 10.8289 15.2297L11.1115 16.157C11.1843 16.4011 11.334 16.6151 11.5382 16.7673C11.7423 16.9195 11.9902 17.0017 12.2449 17.0017C12.4996 17.0017 12.7474 16.9195 12.9516 16.7673C13.1558 16.6151 13.3054 16.4011 13.3782 16.157L13.6609 15.229C13.6827 15.1558 13.7315 15.0936 13.7975 15.0551C13.8635 15.0166 13.9417 15.0046 14.0162 15.0217L14.9569 15.239C15.2046 15.2955 15.4639 15.2711 15.6967 15.1693C15.9295 15.0675 16.1236 14.8938 16.2504 14.6736C16.3772 14.4534 16.4301 14.1984 16.4012 13.946C16.3724 13.6935 16.2634 13.457 16.0902 13.271L15.4316 12.561C15.3795 12.5041 15.3506 12.4298 15.3506 12.3527C15.3506 12.2756 15.3795 12.2013 15.4316 12.1444L16.0896 11.4357ZM12.2442 14.3537C11.8487 14.3537 11.462 14.2364 11.1331 14.0167C10.8042 13.7969 10.5478 13.4845 10.3965 13.1191C10.2451 12.7536 10.2055 12.3515 10.2826 11.9635C10.3598 11.5756 10.5503 11.2192 10.83 10.9395C11.1097 10.6598 11.4661 10.4693 11.854 10.3921C12.242 10.315 12.6441 10.3546 13.0096 10.506C13.375 10.6573 13.6874 10.9137 13.9072 11.2426C14.1269 11.5715 14.2442 11.9581 14.2442 12.3537C14.2442 12.8841 14.0335 13.3929 13.6584 13.7679C13.2834 14.143 12.7746 14.3537 12.2442 14.3537Z"
          fill="white"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M7.09017 13.782C7.0974 13.8043 7.09994 13.8278 7.09762 13.8511C7.06412 14.1643 7.09939 14.481 7.20095 14.7791C7.2097 14.8042 7.2123 14.831 7.20855 14.8572C7.20479 14.8835 7.19479 14.9085 7.17938 14.9301C7.16396 14.9517 7.14359 14.9693 7.11997 14.9815C7.09635 14.9936 7.07017 14.9999 7.04362 14.9998H2.41162C1.88119 14.9998 1.37248 14.789 0.997407 14.414C0.622335 14.0389 0.411621 13.5302 0.411621 12.9998V3.99976C0.411621 3.46932 0.622335 2.96062 0.997407 2.58554C1.37248 2.21047 1.88119 1.99976 2.41162 1.99976H11.745C12.2754 1.99976 12.7841 2.21047 13.1592 2.58554C13.5342 2.96062 13.745 3.46932 13.745 3.99976V6.95976C13.745 6.99007 13.7368 7.01983 13.7212 7.0458C13.7056 7.07177 13.6831 7.09297 13.6563 7.10709C13.6293 7.12109 13.599 7.12756 13.5686 7.1258C13.5382 7.12404 13.5088 7.11412 13.4836 7.09709C13.4779 7.09315 13.4721 7.08924 13.4664 7.08536C13.1685 6.74277 12.7022 6.52222 12.178 6.52222C11.6135 6.52222 11.1161 6.77796 10.824 7.16642H9.74495C9.70075 7.16642 9.65836 7.18398 9.6271 7.21524C9.59585 7.24649 9.57829 7.28889 9.57829 7.33309V8.28442C9.57831 8.30728 9.57364 8.32989 9.56458 8.35087C9.55553 8.37186 9.54226 8.39076 9.52562 8.40642C9.50904 8.42206 9.48941 8.4341 9.46795 8.44178C9.4465 8.44947 9.42369 8.45264 9.40095 8.45109C9.19328 8.43777 8.98476 8.45393 8.78162 8.49909C8.75723 8.50469 8.73189 8.50466 8.70751 8.499C8.68314 8.49334 8.66038 8.4822 8.64095 8.46642C8.62099 8.45049 8.60495 8.43018 8.59409 8.40706C8.58322 8.38394 8.57782 8.35863 8.57829 8.33309V7.33309C8.57829 7.28889 8.56073 7.24649 8.52947 7.21524C8.49822 7.18398 8.45582 7.16642 8.41162 7.16642H5.74495C5.70075 7.16642 5.65836 7.18398 5.6271 7.21524C5.59585 7.24649 5.57829 7.28889 5.57829 7.33309V9.66842C5.57829 9.71263 5.59585 9.75502 5.6271 9.78627C5.65836 9.81753 5.70075 9.83509 5.74495 9.83509H6.99562C7.02151 9.83498 7.04707 9.84096 7.07023 9.85254C7.09339 9.86412 7.1135 9.88098 7.12895 9.90176C7.1445 9.92219 7.15511 9.94593 7.15997 9.97114C7.16483 9.99635 7.1638 10.0223 7.15695 10.0471C7.10109 10.2487 7.07459 10.4573 7.07829 10.6664C7.07847 10.7102 7.06133 10.7523 7.03061 10.7835C6.99989 10.8147 6.95808 10.8326 6.91429 10.8331H5.74495C5.70075 10.8331 5.65836 10.8506 5.6271 10.8819C5.59585 10.9132 5.57829 10.9556 5.57829 10.9998V13.4998C5.57829 13.544 5.59585 13.5864 5.6271 13.6176C5.65836 13.6489 5.70075 13.6664 5.74495 13.6664H6.93162C6.95502 13.6664 6.97815 13.6714 6.99951 13.6809C7.02088 13.6904 7.03999 13.7043 7.05562 13.7218C7.07118 13.7392 7.08294 13.7598 7.09017 13.782ZM4.52881 9.78427C4.56006 9.75302 4.57762 9.71063 4.57762 9.66642L4.57829 7.33309C4.57829 7.28889 4.56073 7.24649 4.52947 7.21524C4.49822 7.18398 4.45582 7.16642 4.41162 7.16642H1.91162C1.86742 7.16642 1.82503 7.18398 1.79377 7.21524C1.76251 7.24649 1.74495 7.28889 1.74495 7.33309V9.66642C1.74495 9.71051 1.76242 9.7528 1.79353 9.78404C1.82465 9.81528 1.86687 9.83291 1.91095 9.83309H4.41095C4.45516 9.83309 4.49755 9.81553 4.52881 9.78427ZM5.68097 6.15393C5.70127 6.16226 5.72301 6.16651 5.74495 6.16642H8.41162C8.45582 6.16642 8.49822 6.14886 8.52947 6.11761C8.56073 6.08635 8.57829 6.04396 8.57829 5.99976V3.49976C8.57829 3.45555 8.56073 3.41316 8.52947 3.3819C8.49822 3.35065 8.45582 3.33309 8.41162 3.33309H5.74495C5.72301 3.333 5.70127 3.33725 5.68097 3.34558C5.66067 3.35392 5.64222 3.36618 5.62667 3.38167C5.61112 3.39715 5.59879 3.41556 5.59037 3.43582C5.58195 3.45609 5.57762 3.47781 5.57762 3.49976V5.99976C5.57762 6.0217 5.58195 6.04343 5.59037 6.06369C5.59879 6.08396 5.61112 6.10236 5.62667 6.11784C5.64222 6.13333 5.66067 6.14559 5.68097 6.15393ZM12.2164 3.52835C12.0913 3.40333 11.9218 3.33309 11.745 3.33309H9.74495C9.70075 3.33309 9.65836 3.35065 9.6271 3.3819C9.59585 3.41316 9.57829 3.45555 9.57829 3.49976V5.99976C9.57829 6.04396 9.59585 6.08635 9.6271 6.11761C9.65836 6.14886 9.70075 6.16642 9.74495 6.16642H12.245C12.2892 6.16642 12.3315 6.14886 12.3628 6.11761C12.3941 6.08635 12.4116 6.04396 12.4116 5.99976V3.99976C12.4116 3.82294 12.3414 3.65338 12.2164 3.52835ZM4.41162 3.33309H2.41162C2.23481 3.33309 2.06524 3.40333 1.94022 3.52835C1.81519 3.65338 1.74495 3.82294 1.74495 3.99976V5.99976C1.74495 6.04384 1.76242 6.08613 1.79353 6.11737C1.82465 6.14861 1.86687 6.16625 1.91095 6.16642H4.41162C4.45582 6.16642 4.49822 6.14886 4.52947 6.11761C4.56073 6.08635 4.57829 6.04396 4.57829 5.99976V3.49976C4.57829 3.45555 4.56073 3.41316 4.52947 3.3819C4.49822 3.35065 4.45582 3.33309 4.41162 3.33309ZM1.74495 10.9998V12.9998C1.74495 13.1766 1.81519 13.3461 1.94022 13.4712C2.06524 13.5962 2.23481 13.6664 2.41162 13.6664H4.41162C4.45582 13.6664 4.49822 13.6489 4.52947 13.6176C4.56073 13.5864 4.57829 13.544 4.57829 13.4998V10.9998C4.57829 10.9556 4.56073 10.9132 4.52947 10.8819C4.49822 10.8506 4.45582 10.8331 4.41162 10.8331H1.91162C1.86742 10.8331 1.82503 10.8506 1.79377 10.8819C1.76251 10.9132 1.74495 10.9556 1.74495 10.9998Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_1419_7239">
          <rect
            width="16"
            height="18"
            fill="white"
            transform="translate(0.411621 -0.000244141)"
          />
        </clipPath>
      </defs>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 18 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.71093 8.93449L3.56128 6.79363L1.41162 8.93449M3.42462 7.6044C3.46047 9.22172 4.09697 10.7684 5.21112 11.9456C6.32527 13.1228 7.838 13.847 9.45702 13.9782C11.076 14.1094 12.6864 13.6383 13.977 12.656C15.2676 11.6736 16.1468 10.2498 16.4447 8.6595C16.7427 7.06923 16.4382 5.42542 15.5901 4.04569C14.742 2.66597 13.4105 1.64826 11.8529 1.18921C10.2953 0.730155 8.62218 0.862343 7.15674 1.56023"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.04295 8.08988L10.7639 5.10907"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M9.04288 8.0901L12.0237 9.81107"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  [GEOMETRY_TYPE.POINT]: (
    <svg viewBox="0 0 10 13" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 0C3.67439 0.001577 2.40351 0.54425 1.46616 1.50897C0.528809 2.47369 0.00153226 3.78169 0 5.14601C0 8.69242 3.44105 11.9106 4.49526 12.8125C4.637 12.9337 4.81547 13 4.99974 13C5.18401 13 5.36247 12.9337 5.50421 12.8125C6.55684 11.9106 10 8.69134 10 5.14547C9.99833 3.78124 9.47099 2.47339 8.53366 1.50878C7.59632 0.544176 6.32552 0.00157672 5 0ZM5 7.85443C4.47952 7.85443 3.97073 7.69559 3.53797 7.39798C3.10521 7.10037 2.76792 6.67738 2.56874 6.18248C2.36956 5.68758 2.31745 5.143 2.41899 4.61762C2.52053 4.09224 2.77116 3.60964 3.13919 3.23086C3.50723 2.85208 3.97613 2.59413 4.4866 2.48962C4.99708 2.38512 5.5262 2.43875 6.00706 2.64375C6.48792 2.84874 6.89892 3.19589 7.18808 3.64129C7.47724 4.08669 7.63158 4.61033 7.63158 5.14601C7.63158 5.50168 7.56351 5.85388 7.43126 6.18248C7.29901 6.51108 7.10517 6.80965 6.86081 7.06115C6.61644 7.31265 6.32634 7.51216 6.00706 7.64827C5.68778 7.78438 5.34558 7.85443 5 7.85443Z"
        fill="#999999"
      />
    </svg>
  ),
  [GEOMETRY_TYPE.LINE_STRING]: (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 2L2 10" stroke="#999999" strokeWidth="1.5" />
      <circle cx="2" cy="10" r="2" fill="#999999" />
      <circle cx="10" cy="2" r="2" fill="#999999" />
    </svg>
  ),

  [GEOMETRY_TYPE.POLYGON]: (
    <svg viewBox="0 0 13 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M1.50439 12.282L4.13685 5.51279L10.53 2.50427L9.77783 7.39312L9.0257 11.5298L1.50439 12.282Z"
        stroke="#999999"
        strokeWidth="1.5"
      />
      <circle cx="11" cy="2" r="2" fill="#999999" />
      <circle cx="9" cy="11" r="2" fill="#999999" />
      <path
        d="M4 12C4 13.1046 3.10457 14 2 14C0.89543 14 0 13.1046 0 12C0 10.8954 0.89543 10 2 10C3.10457 10 4 10.8954 4 12Z"
        fill="#999999"
      />
      <path
        d="M6 5C6 6.10457 5.10457 7 4 7C2.89543 7 2 6.10457 2 5C2 3.89543 2.89543 3 4 3C5.10457 3 6 3.89543 6 5Z"
        fill="#999999"
      />
    </svg>
  ),
};

const VkfIcon = ({ name }) => {
  return icons[name] ?? "";
};

VkfIcon.propTypes = {
  name: PropTypes.string.isRequired,
};

export default VkfIcon;
