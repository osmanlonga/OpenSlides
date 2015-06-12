angular.module('OpenSlidesApp.agenda', [])

.config(function($stateProvider) {
    $stateProvider
        .state('agenda', {
            url: '/agenda',
            abstract: true,
            template: "<ui-view/>",
        })
        .state('agenda.item', {
            abstract: true,
            template: "<ui-view/>",
        })
        .state('agenda.item.list', {
            resolve: {
                items: function(Agenda) {
                    return Agenda.findAll();
                },
                tree: function($http) {
                    return $http.get('/rest/agenda/item/tree/');
                }
            }
        })
        .state('agenda.item.create', {
            resolve: {
                types: function($http) {
                    // get all item types
                    return $http({ 'method': 'OPTIONS', 'url': '/rest/agenda/item/' });
                }
            }
        })
        .state('agenda.item.detail', {
            resolve: {
                item: function(Agenda, $stateParams) {
                    return Agenda.find($stateParams.id);
                },
                users: function(User) {
                    return User.findAll();
                }
            }
        })
        .state('agenda.item.detail.update', {
            views: {
                '@agenda.item': {}
            },
            resolve: {
                types: function($http) {
                    // get all item types
                    return $http({ 'method': 'OPTIONS', 'url': '/rest/agenda/item/' });
                }
            }
        })
        .state('agenda.item.sort', {
            resolve: {
                items: function(Agenda) {
                    return Agenda.findAll();
                },
                tree: function($http) {
                    return $http.get('/rest/agenda/item/tree/');
                }
            },
            url: '/sort',
            controller: 'AgendaSortCtrl',
        })
        .state('agenda.item.csv-import', {
            url: '/csv-import',
            controller: 'AgendaCSVImportCtrl',
        });
})

.factory('Agenda', function(DS) {
    return DS.defineResource({
        name: 'agenda/item',
        endpoint: '/rest/agenda/item/'
    });
})

.controller('ItemListCtrl', function($scope, Agenda, tree) {
    Agenda.bindAll({}, $scope, 'items');

    // get a 'flat' (ordered) array of agenda tree to display in table
    $scope.flattenedTree = buildTree(tree.data);
    function buildTree(tree, level = 0) {
        var nodes = [];
        var defaultlevel = level;
        _.each(tree, function(node) {
            level = defaultlevel;
            if (node.id) {
                nodes.push({ id: node.id, level: level });
            }
            if (node.children) {
                level++;
                var child = buildTree(node.children, level);
                if (child.length) {
                    nodes = nodes.concat(child);
                }
            }
        });
        return nodes;
    }

    // save changed item
    $scope.save = function (item) {
        Agenda.save(item);
    };
    // delete selected item
    $scope.delete = function (id) {
        Agenda.destroy(id);
    };
})

.controller('ItemDetailCtrl', function($scope, Agenda, User, item) {
    Agenda.bindOne(item.id, $scope, 'item');
    User.bindAll({}, $scope, 'users');
})

.controller('ItemCreateCtrl', function($scope, $state, Agenda, types) {
    $scope.types = types.data.actions.POST.type.choices;  // get all item types
    $scope.save = function (item) {
        if (!item)
            return null;
        item.weight = 0;  // TODO: the rest_api should do this
        item.tags = [];   // TODO: the rest_api should do this
        Agenda.create(item).then(
            function(success) {
                $state.go('agenda.item.list');
            }
        );
    };
})

.controller('ItemUpdateCtrl', function($scope, $state, Agenda, types, item) {
    $scope.types = types.data.actions.POST.type.choices;  // get all item types
    $scope.item = item;
    $scope.save = function (item) {
        Agenda.save(item).then(
            function(success) {
                $state.go('agenda.item.list');
            }
        );
    };
})

.controller('AgendaSortCtrl', function($scope, $http, Agenda, tree) {
    Agenda.bindAll({}, $scope, 'items');
    $scope.tree = tree.data;

    // set changed agenda tree
    $scope.treeOptions = {
        dropped: function(e) {
            $http.put('/rest/agenda/item/tree/', {tree: $scope.tree});
        }
      };
})

.controller('AgendaCSVImportCtrl', function($scope, Agenda) {
    // TODO
});