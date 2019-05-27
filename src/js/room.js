"use strict";

(() => {

  const roomid = (() => {
    let id = 0;

    document.querySelectorAll('script').forEach((el) => {
      const script = el.textContent;
      const regexp = /g_room\s*=\s*'(?<roomId>\d+)'/i;
      const result = script.match(regexp);
      if (result) id = +result.groups.roomId;
    });

    return id;
  })();

  if (roomid === 0) return false;

  const isFirstFloor = roomid >= 18612481 && roomid <= 18612529;
  const isSecondFloor = roomid >= 18612737 && roomid <= 18612991;
  const isThirdFloor = roomid >= 18612993 && roomid <= 18613072;
  const lab_level = isFirstFloor ? 1 : isSecondFloor ? 2 : isThirdFloor ? 3 : 0;

  if (roomid === 18546688) {
    return chrome.extension.sendRequest({
      action: 'clear'
    });
  }

  if (!lab_level) return false;

  const ways = {
    'На север': 'lab_top',
    'На запад': 'lab_left',
    'На восток': 'lab_right',
    'На юг': 'lab_down'
  };
  const npc = {
    '79': 'skull_count',
    '77': 'sunduk_count',
    '78': 'oksunduk_count',
    '74': 'fontanb_count',
    '75': 'fontano_count',
    '76': 'strportal',
    '80': 'cityportal',
    '145': 'bezgolov',
  };

  let data = {
    roomid,
    lab_level
  };

  document.querySelectorAll('.roomnpc a[href^="/room"] img').forEach((node) => {
    const title = node.getAttribute('title');
    if (title in ways) data[ways[title]] = 1;
  });

  document.querySelectorAll('.roomnpc a[href^="/user"]').forEach((node) => {
    const href = node.getAttribute('href');
    const regexp = /id=-(?<npcid>\d+)/i;
    const result = href.match(regexp);
    const {npcid} = result.groups;

    if (npcid in npc) {
      let count = (npc[npcid] in data) ? data[npc[npcid]] : 0;
      data[npc[npcid]] = ++count;
    }
  });

  return chrome.extension.sendRequest({
    action: 'save',
    data
  });
})();