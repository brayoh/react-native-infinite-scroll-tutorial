import React, { Component } from 'react';
import {
  Dimensions,
  View,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Text
} from 'react-native';

// presentational components
import ContainedImage from './components/ContainedImage';
import BeerPreviewCard from './components/BeerPreviewCard';

// app theme
import { colors } from './config/theme';

// axios service
import axiosService from './utils/lib/axiosService';

// screen height and width
const { width, height } = Dimensions.get('window');

export default class AllBeersScreen extends Component {
  state = {
    data: [],
    page: 1,
    loading: true,
    loadingMore: false,
    filtering: false,
    refreshing: false,
    flatListReady: false,
    error: null
  };

  componentDidMount() {
    this._fetchAllBeers();
  }

  _fetchAllBeers = () => {
    const { page } = this.state;
    const URL = `/beers?page=${page}&per_page=10`;

    axiosService
      .request({
        url: URL,
        method: 'GET'
      })
      .then(response => {
        this.setState((prevState, nextProps) => ({
          data:
            page === 1
              ? Array.from(response.data)
              : [...this.state.data, ...response.data],
          loading: false,
          loadingMore: false,
          refreshing: false
        }));
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  _handleScrolled = () => {
    if (!this.state.flatListReady) {
      this.setState(
        (prevState, nextProps) => ({ flatListReady: true }),
        () => {
          this._handleLoadMore();
        }
      );
    }
  };

  _handleRefresh = () => {
    this.setState(
      {
        page: 1,
        refreshing: true
      },
      () => {
        this._fetchAllBeers();
      }
    );
  };

  _handleLoadMore = () => {
    if (this.state.flatListReady) {
      this.setState(
        (prevState, nextProps) => ({
          page: prevState.page + 1,
          loadingMore: true
        }),
        () => {
          this._fetchAllBeers();
        }
      );
    }
  };

  // _renderHeader = () => {
  //   const { filtering, searchBar, data } = this.state;

  //   return (
  //     <View
  //       style={{
  //         position: 'relative',
  //         height: height * 0.33,
  //         width
  //       }}
  //     >
  //       <SearchBar
  //         handleOnValueChange={this._handleOnValueChange}
  //         handleOnChangeText={this._handleOnChangeText}
  //         selected={this.state.searchBar.selected}
  //         style={{ position: 'relative' }}
  //       />
  //       <ContainedImage
  //         resizeMode="cover"
  //         source={require('../images/header_background.jpg')}
  //         style={{ height: '100%', width: '100%' }}
  //       />
  //       {filtering ? (
  //         <ActivityIndicator />
  //       ) : searchBar.searchText.length > 0 ? (
  //         <Text
  //           style={{ textAlign: 'center', marginTop: 2 }}
  //         >{`${this._formatResultsText(data.length, 'result')} found`}</Text>
  //       ) : null}
  //     </View>
  //   );
  // };

  _renderFooter = () => {
    if (!this.state.loadingMore) return null;

    return (
      <View
        style={{
          position: 'relative',
          width: width,
          height: height,
          paddingVertical: 20,
          borderTopWidth: 1,
          marginTop: 10,
          marginBottom: 10,
          borderColor: colors.veryLightPink
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  render() {
    return !this.state.loading ? (
      <ScrollView onScrollBeginDrag={this._handleScrolled}>
        <FlatList
          contentContainerStyle={{
            flex: 1,
            flexDirection: 'column',
            height: '100%',
            width: '100%'
          }}
          numColumns={2}
          data={this.state.data}
          renderItem={({ item }) => (
            <View
              style={{
                marginTop: 25,
                width: '50%'
              }}
            >
              <BeerPreviewCard name={item.name} imageUrl={item.image_url} />
            </View>
          )}
          keyExtractor={item => item.id.toString()}
          // ListHeaderComponent={this._renderHeader}
          ListFooterComponent={this._renderFooter}
          onRefresh={this._handleRefresh}
          refreshing={this.state.refreshing}
          onEndReached={this._handleLoadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={2}
        />
      </ScrollView>
    ) : (
      <View>
        <Text style={{ alignSelf: 'center' }}>Loading beers</Text>
        <ActivityIndicator />
      </View>
    );
  }
}
