/*************************************************
 * 基本配置
 *************************************************/

// 摘要前后截取长度
var summaryInclude = 60;

// Fuse.js 搜索配置
var fuseOptions = {
  shouldSort: true,
  includeMatches: true,
  threshold: 0.0,
  tokenize: true,

  location: 0,
  distance: 100,
  maxPatternLength: 32,
  minMatchCharLength: 1,

  keys: [
    { name: "title",      weight: 0.8 },
    { name: "contents",   weight: 0.5 },
    { name: "tags",       weight: 0.3 },
    { name: "categories", weight: 0.3 }
  ]
};

/*************************************************
 * 初始化：读取 URL 参数
 *************************************************/

var searchQuery = param("s");

if (searchQuery) {
  $("#search-query").val(searchQuery);
  executeSearch(searchQuery);
} else {
  $("#search-results").append(
    "<p>Please enter a word or phrase above</p>"
  );
}

/*************************************************
 * 执行搜索
 *************************************************/

function executeSearch(searchQuery) {
  $.getJSON("/index.json", function (data) {
    var fuse = new Fuse(data, fuseOptions);
    var result = fuse.search(searchQuery);

    console.log({ matches: result });

    if (result.length > 0) {
      populateResults(result);
    } else {
      $("#search-results").append("<p>No matches found</p>");
    }
  });
}

/*************************************************
 * 渲染搜索结果
 *************************************************/

function populateResults(result) {
  $.each(result, function (key, value) {
    var contents = value.item.contents || "";
    var snippet = "";
    var snippetHighlights = [];

    // tokenize=true：直接高亮搜索词
    if (fuseOptions.tokenize) {
      snippetHighlights.push(searchQuery);
    } else {
      $.each(value.matches, function (_, match) {
        if (match.key === "contents") {
          var start = Math.max(
            match.indices[0][0] - summaryInclude,
            0
          );
          var end = Math.min(
            match.indices[0][1] + summaryInclude,
            contents.length
          );

          snippet += contents.substring(start, end);
          snippetHighlights.push(
            contents.substring(
              match.indices[0][0],
              match.indices[0][1] + 1
            )
          );
        }
      });
    }

    // 没命中时，直接截取前一段
    if (snippet.length < 1) {
      snippet = contents.substring(0, summaryInclude * 2);
    }

    // 读取模板
    var template = $("#search-result-template").html();

    // 渲染模板
    var output = render(template, {
      key: key,
      title: value.item.title,
      link: value.item.permalink,
      tags: value.item.tags,
      categories: value.item.categories,
      snippet: snippet
    });

    $("#search-results").append(output);

    // 高亮关键词
    $.each(snippetHighlights, function (_, word) {
      $("#summary-" + key).mark(word);
    });
  });
}

/*************************************************
 * URL 参数读取
 *************************************************/

function param(name) {
  return decodeURIComponent(
    (location.search.split(name + "=")[1] || "")
      .split("&")[0]
  ).replace(/\+/g, " ");
}

/*************************************************
 * 模板渲染（支持 ${ isset xxx }）
 *************************************************/

function render(templateString, data) {
  var conditionalPattern =
    /\$\{\s*isset ([a-zA-Z]*) \s*\}(.*)\$\{\s*end\s*}/g;

  var copy = templateString;
  var match;

  // 处理条件块
  while ((match = conditionalPattern.exec(templateString)) !== null) {
    if (data[match[1]]) {
      copy = copy.replace(match[0], match[2]);
    } else {
      copy = copy.replace(match[0], "");
    }
  }

  templateString = copy;

  // 普通变量替换
  for (var key in data) {
    var re = new RegExp("\\$\\{\\s*" + key + "\\s*\\}", "g");
    templateString = templateString.replace(re, data[key]);
  }

  return templateString;
}